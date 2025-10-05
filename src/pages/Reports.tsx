import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useCategories } from "@/hooks/useCategories";
import { calculateMonthlyAmount, formatCurrency, getTotalMonthlySpend, getTotalYearlySpend } from "@/lib/subscriptionCalculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, DollarSign, Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { subscriptions, isLoading } = useSubscriptions();
  const { categories } = useCategories();

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

  const activeSubscriptions = subscriptions.filter(sub => sub.status === "active");
  const monthlyTotal = getTotalMonthlySpend(activeSubscriptions);
  const yearlyTotal = getTotalYearlySpend(activeSubscriptions);

  // Group by billing cycle
  const cycleData = [
    { name: "חודשי", count: activeSubscriptions.filter(s => s.billing_cycle === "monthly").length },
    { name: "רבעוני", count: activeSubscriptions.filter(s => s.billing_cycle === "quarterly").length },
    { name: "שנתי", count: activeSubscriptions.filter(s => s.billing_cycle === "yearly").length },
  ].filter(d => d.count > 0);

  // Group by category
  const categoryData = categories.map(cat => {
    const catSubs = activeSubscriptions.filter(s => s.category_id === cat.id);
    const total = catSubs.reduce((sum, sub) => sum + calculateMonthlyAmount(sub.cost, sub.billing_cycle), 0);
    return {
      name: cat.name,
      value: total,
      color: cat.color,
    };
  }).filter(d => d.value > 0);

  // Top 5 expensive subscriptions
  const topExpensive = [...activeSubscriptions]
    .sort((a, b) => calculateMonthlyAmount(b.cost, b.billing_cycle) - calculateMonthlyAmount(a.cost, a.billing_cycle))
    .slice(0, 5);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-4xl font-bold">דוחות</h1>
          <p className="text-muted-foreground">ניתוח עלויות והתובנות על המנויים שלך</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">מנויים פעילים</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
              <p className="text-xs text-muted-foreground">מתוך {subscriptions.length} סה"כ</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">עלות חודשית</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyTotal, "ILS")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">עלות שנתית</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(yearlyTotal, "ILS")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממוצע למנוי</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(activeSubscriptions.length > 0 ? monthlyTotal / activeSubscriptions.length : 0, "ILS")}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Billing Cycle Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>התפלגות לפי תדירות תשלום</CardTitle>
            </CardHeader>
            <CardContent>
              {cycleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cycleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  אין נתונים להצגה
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>התפלגות עלויות לפי קטגוריה</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value, "ILS")}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number, "ILS")} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  אין נתונים להצגה
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top 5 Most Expensive */}
        <Card>
          <CardHeader>
            <CardTitle>5 המנויים היקרים ביותר</CardTitle>
          </CardHeader>
          <CardContent>
            {topExpensive.length > 0 ? (
              <div className="space-y-4">
                {topExpensive.map((sub, index) => (
                  <div key={sub.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{sub.service_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sub.billing_cycle === "monthly" ? "חודשי" : sub.billing_cycle === "quarterly" ? "רבעוני" : "שנתי"}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{formatCurrency(calculateMonthlyAmount(sub.cost, sub.billing_cycle), sub.currency)}</p>
                      <p className="text-xs text-muted-foreground">לחודש</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                אין מנויים פעילים
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;