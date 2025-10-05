import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SubscriptionSuggestion {
  id: string;
  user_id: string;
  invoice_id: string | null;
  service_name: string;
  vendor: string | null;
  amount: number;
  currency: string;
  billing_cycle: string;
  next_renewal_date: string;
  confidence_score: number;
  status: string;
  duplicate_of: string | null;
  created_at: string;
  updated_at: string;
}

export const useSubscriptionSuggestions = () => {
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["subscription-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SubscriptionSuggestion[];
    },
  });

  const approveSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      // Get suggestion details
      const { data: suggestion, error: fetchError } = await supabase
        .from("subscription_suggestions")
        .select("*")
        .eq("id", suggestionId)
        .single();

      if (fetchError) throw fetchError;

      // Create subscription
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: suggestion.user_id,
          service_name: suggestion.service_name,
          vendor: suggestion.vendor,
          cost: suggestion.amount,
          currency: suggestion.currency,
          billing_cycle: suggestion.billing_cycle,
          next_renewal_date: suggestion.next_renewal_date,
          start_date: new Date().toISOString().split('T')[0],
          status: 'active',
        });

      if (insertError) throw insertError;

      // Update suggestion status
      const { error: updateError } = await supabase
        .from("subscription_suggestions")
        .update({ status: "approved" })
        .eq("id", suggestionId);

      if (updateError) throw updateError;

      // Update linked invoice
      if (suggestion.invoice_id) {
        await supabase
          .from("invoices")
          .update({ status: "approved" })
          .eq("id", suggestion.invoice_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("המנוי נוסף בהצלחה");
    },
    onError: () => {
      toast.error("שגיאה באישור ההצעה");
    },
  });

  const rejectSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from("subscription_suggestions")
        .update({ status: "rejected" })
        .eq("id", suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-suggestions"] });
      toast.success("ההצעה נדחתה");
    },
    onError: () => {
      toast.error("שגיאה בדחיית ההצעה");
    },
  });

  return {
    suggestions: suggestions || [],
    isLoading,
    approveSuggestion,
    rejectSuggestion,
  };
};
