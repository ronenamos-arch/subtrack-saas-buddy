import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-4xl font-bold">דוחות</h1>
          <p className="text-muted-foreground">ניתוח עלויות והתובנות</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>בקרוב</CardTitle>
            <CardDescription>דוחות מתקדמים יהיו זמינים בקרוב</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;