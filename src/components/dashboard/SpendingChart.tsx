import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Subscription } from "@/hooks/useSubscriptions";
import { calculateMonthlyAmount } from "@/lib/subscriptionCalculations";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";

interface SpendingChartProps {
  subscriptions: Subscription[];
}

export const SpendingChart = ({ subscriptions }: SpendingChartProps) => {
  const { convertCurrency, userCurrency, getCurrencySymbol } = useCurrencyConversion();

  // Generate data for last 12 months
  const generateChartData = () => {
    const months = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("he-IL", { month: "short" });

      // Calculate spending for this month with currency conversion
      const monthSpending = subscriptions
        .filter((sub) => {
          const startDate = new Date(sub.start_date);
          return startDate <= date && sub.status === "active";
        })
        .reduce((total, sub) => {
          const monthlyCost = calculateMonthlyAmount(sub.cost, sub.billing_cycle);
          return total + convertCurrency(monthlyCost, sub.currency);
        }, 0);

      // Calculate potential savings (inactive subscriptions) with currency conversion
      const inactiveSpending = subscriptions
        .filter((sub) => {
          const startDate = new Date(sub.start_date);
          return startDate <= date && sub.status !== "active";
        })
        .reduce((total, sub) => {
          const monthlyCost = calculateMonthlyAmount(sub.cost, sub.billing_cycle);
          return total + convertCurrency(monthlyCost, sub.currency);
        }, 0);

      months.push({
        name: monthName,
        הוצאות: Math.round(monthSpending),
        חיסכון: Math.round(inactiveSpending),
      });
    }

    return months;
  };

  const data = generateChartData();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle>מגמות הוצאות חודשיות</CardTitle>
        <CardDescription>הוצאות והיכולת ב-12 החודשים האחרונים</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              formatter={(value: any) => [`${getCurrencySymbol(userCurrency)}${Math.round(value as number)}`]}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: "20px"
              }}
            />
            <Line
              type="monotone"
              dataKey="הוצאות"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="חיסכון"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--success))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
