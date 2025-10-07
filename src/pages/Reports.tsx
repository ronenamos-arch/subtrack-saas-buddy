import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/browserClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useCategories } from "@/hooks/useCategories";
import { calculateMonthlyAmount, getTotalMonthlySpend, getTotalYearlySpend } from "@/lib/subscriptionCalculations";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart } from "recharts";
import { TrendingUp, DollarSign, Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const { subscriptions, isLoading } = useSubscriptions();
  const { categories } = useCategories();
  const { formatCurrency, convertCurrency, userCurrency } = useCurrencyConversion();

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

  // Filter subscriptions by category and year
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const categoryMatch = selectedCategory === "all" || sub.category_id === selectedCategory;
    const yearMatch = selectedYear === "all" || new Date(sub.start_date).getFullYear().toString() === selectedYear;
    return categoryMatch && yearMatch;
  });

  const activeSubscriptions = filteredSubscriptions.filter(sub => sub.status === "active");
  
  // Calculate totals with currency conversion
  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    const monthlyCost = calculateMonthlyAmount(sub.cost, sub.billing_cycle);
    return total + convertCurrency(monthlyCost, sub.currency);
  }, 0);
  
  const yearlyTotal = activeSubscriptions.reduce((total, sub) => {
    const yearlyCost = sub.billing_cycle === "monthly" ? sub.cost * 12 :
                       sub.billing_cycle === "quarterly" ? sub.cost * 4 :
                       sub.cost;
    return total + convertCurrency(yearlyCost, sub.currency);
  }, 0);

  // Group by billing cycle with amount and count
  const cycleData = [
    { 
      name: "חודשי", 
      count: activeSubscriptions.filter(s => s.billing_cycle === "monthly").length,
      amount: activeSubscriptions
        .filter(s => s.billing_cycle === "monthly")
        .reduce((sum, sub) => sum + convertCurrency(calculateMonthlyAmount(sub.cost, sub.billing_cycle), sub.currency), 0)
    },
    { 
      name: "רבעוני", 
      count: activeSubscriptions.filter(s => s.billing_cycle === "quarterly").length,
      amount: activeSubscriptions
        .filter(s => s.billing_cycle === "quarterly")
        .reduce((sum, sub) => sum + convertCurrency(calculateMonthlyAmount(sub.cost, sub.billing_cycle), sub.currency), 0)
    },
    { 
      name: "שנתי", 
      count: activeSubscriptions.filter(s => s.billing_cycle === "yearly").length,
      amount: activeSubscriptions
        .filter(s => s.billing_cycle === "yearly")
        .reduce((sum, sub) => sum + convertCurrency(calculateMonthlyAmount(sub.cost, sub.billing_cycle), sub.currency), 0)
    },
  ].filter(d => d.count > 0);

  // Group by category with currency conversion
  const categoryData = categories.map(cat => {
    const catSubs = activeSubscriptions.filter(s => s.category_id === cat.id);
    const total = catSubs.reduce((sum, sub) => {
      const monthlyCost = calculateMonthlyAmount(sub.cost, sub.billing_cycle);
      return sum + convertCurrency(monthlyCost, sub.currency);
    }, 0);
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

        {/* Filters */}
        <DashboardFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />

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
              <div className="text-2xl font-bold">{formatCurrency(monthlyTotal, userCurrency, { convert: false })}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">עלות שנתית</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(yearlyTotal, userCurrency, { convert: false })}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממוצע למנוי</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(activeSubscriptions.length > 0 ? monthlyTotal / activeSubscriptions.length : 0, userCurrency, { convert: false })}
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
                  <ComposedChart data={cycleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis 
                      yAxisId="left" 
                      stroke="hsl(var(--primary))"
                      label={{ value: 'סכום חודשי', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      stroke="hsl(var(--chart-2))"
                      label={{ value: 'מספר מנויים', angle: 90, position: 'insideRight', fill: 'hsl(var(--foreground))' }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === "amount") return [formatCurrency(value as number, userCurrency, { convert: false }), "סכום חודשי"];
                        return [value, "מספר מנויים"];
                      }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--primary))",
                        fontWeight: "600",
                      }}
                      labelStyle={{
                        color: "hsl(var(--primary))",
                        fontWeight: "600",
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="amount" fill="hsl(var(--primary))" name="סכום חודשי" />
                    <Bar yAxisId="right" dataKey="count" fill="hsl(var(--chart-2))" name="מספר מנויים" />
                  </ComposedChart>
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
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value, userCurrency, { convert: false })}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number, userCurrency, { convert: false })} />
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