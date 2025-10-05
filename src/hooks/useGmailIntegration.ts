import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGmailIntegration = () => {
  const queryClient = useQueryClient();

  const { data: gmailStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["gmail-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gmail_tokens")
        .select("email_address, created_at")
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data ? { connected: true, email: data.email_address } : { connected: false };
    },
  });

  const connectGmail = useMutation({
    mutationFn: async (code: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("gmail-oauth", {
        body: { code, action: "exchange" },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
      toast.success(`Gmail מחובר: ${data.email}`);
    },
    onError: (error: any) => {
      console.error("Error connecting Gmail:", error);
      toast.error("שגיאה בחיבור Gmail");
    },
  });

  const disconnectGmail = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("gmail-oauth", {
        body: { action: "disconnect" },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
      toast.success("Gmail נותק בהצלחה");
    },
    onError: () => {
      toast.error("שגיאה בניתוק Gmail");
    },
  });

  const scanEmails = useMutation({
    mutationFn: async (daysBack: number = 365) => {
      const { data, error } = await supabase.functions.invoke("scan-gmail", {
        body: { daysBack },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-suggestions"] });
      toast.success(
        `סריקה הושלמה: נמצאו ${data.messagesFound} הודעות, ${data.invoicesProcessed} חשבוניות עובדו, ${data.suggestionsCreated} הצעות נוצרו`
      );
    },
    onError: (error: any) => {
      console.error("Error scanning emails:", error);
      toast.error("שגיאה בסריקת אימיילים");
    },
  });

  const initiateGmailAuth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("gmail-oauth", {
        body: { action: "get-config" },
      });

      if (error) throw error;

      const { clientId, redirectUri } = data;
      const scope = "https://www.googleapis.com/auth/gmail.readonly";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Error initiating Gmail auth:", error);
      toast.error("שגיאה בהפעלת אימות Gmail");
    }
  };

  return {
    gmailStatus,
    isCheckingStatus,
    connectGmail,
    disconnectGmail,
    scanEmails,
    initiateGmailAuth,
  };
};
