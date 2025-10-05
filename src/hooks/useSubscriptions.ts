import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  vendor: string | null;
  logo_url: string | null;
  cost: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "quarterly";
  start_date: string;
  next_renewal_date: string;
  status: "active" | "paused" | "cancelled";
  category_id: string | null;
  licenses_count: number;
  licenses_used: number;
  notes: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string;
  };
}

export const useSubscriptions = () => {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .order("next_renewal_date", { ascending: true });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  const addSubscription = useMutation({
    mutationFn: async (subscription: Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at" | "categories">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          ...subscription,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "המנוי נוסף בהצלחה",
        description: "המנוי החדש נוסף למערכת",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בהוספת מנוי",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subscription> & { id: string }) => {
      const { data, error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "המנוי עודכן בהצלחה",
        description: "השינויים נשמרו",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעדכון מנוי",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "המנוי נמחק בהצלחה",
        description: "המנוי הוסר מהמערכת",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקת מנוי",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    subscriptions: subscriptions || [],
    isLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  };
};
