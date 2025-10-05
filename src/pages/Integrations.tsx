import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import { Mail, FileText, Slack, Webhook, Zap, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Integrations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleConnect = (name: string) => {
    toast({
      title: "בקרוב",
      description: `אינטגרציה עם ${name} תהיה זמינה בקרוב`,
    });
  };

  const integrations = [
    {
      title: "Gmail",
      description: "סרוק אוטומטית חשבוניות מתיבת הדואר שלך וזהה מנויים חדשים",
      icon: Mail,
      status: "coming_soon" as const,
    },
    {
      title: "Slack",
      description: "קבל התראות על חידושי מנויים ועדכונים ישירות לערוץ Slack שלך",
      icon: Slack,
      status: "coming_soon" as const,
    },
    {
      title: "Zapier",
      description: "חבר את מערכת המנויים ל-3000+ אפליקציות דרך Zapier",
      icon: Zap,
      status: "beta" as const,
      onConnect: () => handleConnect("Zapier"),
    },
    {
      title: "Webhooks",
      description: "שלח התראות אוטומטיות למערכות אחרות בארגון שלך",
      icon: Webhook,
      status: "coming_soon" as const,
    },
    {
      title: "Google Calendar",
      description: "סנכרן תאריכי חידוש ללוח השנה של Google",
      icon: Calendar,
      status: "coming_soon" as const,
    },
    {
      title: "QuickBooks",
      description: "סנכרן הוצאות על מנויים למערכת החשבונאות שלך",
      icon: FileText,
      status: "coming_soon" as const,
    },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-4xl font-bold">אינטגרציות</h1>
          <p className="text-muted-foreground">חבר את מערכת המנויים שלך לשירותים אחרים</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.title} {...integration} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Integrations;