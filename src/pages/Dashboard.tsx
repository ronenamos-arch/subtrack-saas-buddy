import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, Calendar, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { StatCard } from "@/components/dashboard/StatCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { UpcomingRenewals } from "@/components/dashboard/UpcomingRenewals";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import {
  getTotalMonthlySpend,
  getUpcomingRenewals,
  formatCurrency,
  calculateMonthlyAmount,
} from "@/lib/subscriptionCalculations";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { subscriptions, isLoading } = useSubscriptions();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
  const inactiveSubscriptions = subscriptions.filter((sub) => sub.status !== "active");
  const totalMonthlySpend = getTotalMonthlySpend(subscriptions);
  const upcomingRenewals = getUpcomingRenewals(subscriptions, 7);
  const potentialSavings = inactiveSubscriptions.reduce(
    (total, sub) => total + calculateMonthlyAmount(sub.cost, sub.billing_cycle),
    0
  );
  const averagePerSubscription = activeSubscriptions.length > 0 
    ? totalMonthlySpend / activeSubscriptions.length 
    : 0;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-4xl font-bold">דשבורד פיננסי</h1>
          <p className="text-muted-foreground">ניתוח מעמיק של המנויים הפיננסיים שלך</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="הוצאה חודשית"
            value={formatCurrency(totalMonthlySpend)}
            description={`${activeSubscriptions.length} מנויים פעילים`}
            icon={CreditCard}
            trend={{
              value: "2.5%",
              isPositive: true
            }}
          />

          <StatCard
            title="מנויים פעילים"
            value={activeSubscriptions.length}
            description="מתוך חודש קודם"
            icon={Zap}
            trend={{
              value: "1.2%",
              isPositive: false
            }}
          />

          <StatCard
            title="חידושים קרובים"
            value={upcomingRenewals.length}
            description="ב-7 הימים הקרובים"
            icon={Calendar}
          />

          <StatCard
            title="פוטנציאל חיסכון"
            value={formatCurrency(potentialSavings)}
            description="מ-ה מיטוב לא פעילים"
            icon={TrendingUp}
          />

          <StatCard
            title="ממוצע למנוי"
            value={formatCurrency(averagePerSubscription)}
            description="מתוך חודש קודם"
            icon={TrendingUp}
            trend={{
              value: "0.8%",
              isPositive: true
            }}
          />
        </div>

        {activeSubscriptions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>התחל במעקב אחר המנויים שלך</CardTitle>
              <CardDescription>
                נראה שעדיין לא הוספת מנויים. התחל על ידי הוספת המנוי הראשון שלך ונתחיל לעקוב אחר ההוצאות.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-24 w-24 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-semibold mb-2">אין מנויים עדיין</p>
                <p className="text-sm text-muted-foreground mb-6">
                  לך לעמוד המנויים כדי להתחיל להוסיף מנויים
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <CategoryBreakdown subscriptions={subscriptions} />
              <SpendingChart subscriptions={subscriptions} />
            </div>

            <InsightsSection subscriptions={subscriptions} />

            <UpcomingRenewals subscriptions={subscriptions} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;