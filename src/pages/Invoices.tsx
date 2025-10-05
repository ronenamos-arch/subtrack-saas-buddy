import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Invoices = () => {
  const navigate = useNavigate();
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-4xl font-bold">חשבוניות מייל</h1>
          <p className="text-muted-foreground">סריקה וזיהוי אוטומטי של חשבוניות ממייל</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>תכונה בפיתוח</AlertTitle>
          <AlertDescription>
            סריקת חשבוניות אוטומטית מתיבת הדואר נמצאת בפיתוח ותהיה זמינה בקרוב.
            התכונה תאפשר לך לסרוק אוטומטית חשבוניות ולזהות מנויים חדשים.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">חיבור Gmail</CardTitle>
              <CardDescription className="text-center">
                חבר את חשבון Gmail שלך לסריקה אוטומטית של חשבוניות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                <Mail className="ml-2 h-4 w-4" />
                בקרוב
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">העלאת חשבוניות</CardTitle>
              <CardDescription className="text-center">
                העלה חשבוניות ידנית לזיהוי אוטומטי
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                <Upload className="ml-2 h-4 w-4" />
                בקרוב
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">היסטוריית חשבוניות</CardTitle>
              <CardDescription className="text-center">
                צפה בכל החשבוניות שסרקת
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <FileText className="ml-2 h-4 w-4" />
                בקרוב
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>איך זה יעבוד?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">חבר את חשבון המייל</h3>
                <p className="text-sm text-muted-foreground">
                  חבר את חשבון Gmail שלך באופן מאובטח
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">סריקה אוטומטית</h3>
                <p className="text-sm text-muted-foreground">
                  המערכת תסרוק אוטומטית חשבוניות חדשות מהמייל שלך
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">זיהוי מנויים</h3>
                <p className="text-sm text-muted-foreground">
                  המערכת תזהה מנויים חדשים ותוסיף אותם אוטומטית למעקב
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;