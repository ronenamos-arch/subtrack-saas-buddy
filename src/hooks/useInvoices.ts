import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Invoice {
  id: string;
  user_id: string;
  email_id: string | null;
  sender: string | null;
  subject: string | null;
  received_date: string | null;
  amount: number | null;
  currency: string | null;
  service_name: string | null;
  billing_date: string | null;
  billing_cycle: string | null;
  pdf_url: string | null;
  parsed_data: any;
  status: string;
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useInvoices = () => {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
  });

  const uploadInvoice = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL for parsing (valid for 1 hour)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(fileName, 3600);

      if (signedUrlError) throw signedUrlError;

      // Get public URL for storage
      const { data: { publicUrl } } = supabase.storage
        .from('invoices')
        .getPublicUrl(fileName);

      // Parse invoice with AI using signed URL
      const { data: parseData, error: parseError } = await supabase.functions.invoke(
        'parse-invoice',
        {
          body: { fileUrl: signedUrlData.signedUrl, fileName: file.name }
        }
      );

      if (parseError) throw parseError;

      const parsedData = parseData?.data || {};

      // Create invoice record
      const { data: invoice, error: insertError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          pdf_url: publicUrl,
          sender: parsedData.sender,
          service_name: parsedData.service_name,
          amount: parsedData.amount,
          currency: parsedData.currency || 'ILS',
          billing_date: parsedData.billing_date,
          billing_cycle: parsedData.billing_cycle,
          parsed_data: parsedData,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("החשבונית הועלתה ונותחה בהצלחה");
    },
    onError: (error: any) => {
      console.error("Error uploading invoice:", error);
      toast.error("שגיאה בהעלאת החשבונית");
    },
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // If status is approved, create or update subscription
      if (status === 'approved') {
        // Get invoice details
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', id)
          .single();

        if (invoiceError) throw invoiceError;

        // Check if there's already a subscription for this service
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .ilike('service_name', invoice.service_name || '')
          .maybeSingle();

        let subscriptionId = existingSubscription?.id;

        if (existingSubscription) {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              cost: invoice.amount || 0,
              billing_cycle: invoice.billing_cycle || 'monthly',
              next_renewal_date: invoice.billing_date || new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSubscription.id);

          if (updateError) throw updateError;
        } else {
          // Create new subscription
          const { data: newSubscription, error: createError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              service_name: invoice.service_name || 'שירות ללא שם',
              vendor: invoice.sender,
              cost: invoice.amount || 0,
              currency: invoice.currency || 'ILS',
              billing_cycle: invoice.billing_cycle || 'monthly',
              start_date: invoice.billing_date || new Date().toISOString().split('T')[0],
              next_renewal_date: invoice.billing_date || new Date().toISOString().split('T')[0],
              status: 'active',
            })
            .select()
            .single();

          if (createError) throw createError;
          subscriptionId = newSubscription.id;
        }

        // Update invoice with subscription_id and status
        const { error: updateInvoiceError } = await supabase
          .from('invoices')
          .update({ 
            status,
            subscription_id: subscriptionId 
          })
          .eq('id', id);

        if (updateInvoiceError) throw updateInvoiceError;
      } else {
        // Just update status
        const { error } = await supabase
          .from('invoices')
          .update({ status })
          .eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      
      if (variables.status === 'approved') {
        toast.success("החשבונית אושרה והמנוי עודכן בהצלחה");
      } else {
        toast.success("סטטוס החשבונית עודכן");
      }
    },
    onError: () => {
      toast.error("שגיאה בעדכון החשבונית");
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("החשבונית נמחקה");
    },
    onError: () => {
      toast.error("שגיאה במחיקת החשבונית");
    },
  });

  return {
    invoices: invoices || [],
    isLoading,
    uploadInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  };
};