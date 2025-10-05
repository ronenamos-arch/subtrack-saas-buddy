import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, History } from "lucide-react";
import { Loader2 } from "lucide-react";
import { InvoiceUpload } from "@/components/invoices/InvoiceUpload";
import { InvoiceList } from "@/components/invoices/InvoiceList";

const Invoices = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">סריקת חשבוניות</h1>
            <p className="text-muted-foreground mt-2">
              העלה חשבוניות לניתוח אוטומטי עם בינה מלאכותית
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/invoices/history")}
          >
            <History className="h-4 w-4 ml-2" />
            היסטוריית חשבוניות
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            חיבור Gmail לסריקה אוטומטית יהיה זמין בקרוב. כרגע תוכל להעלות חשבוניות ידנית.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <InvoiceUpload />
          </div>
          <div className="lg:col-span-2">
            <InvoiceList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;