import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Subscription } from "@/hooks/useSubscriptions";
import { calculateMonthlyAmount } from "@/lib/subscriptionCalculations";

interface SpendingChartProps {
  subscriptions: Subscription[];
}

export const SpendingChart = ({ subscriptions }: SpendingChartProps) => {
  // Generate data for last 6 months
  const generateChartData = () => {
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("he-IL", { month: "short" });

      // Calculate spending for this month
      const monthSpending = subscriptions
        .filter((sub) => {
          const startDate = new Date(sub.start_date);
          return startDate <= date && sub.status === "active";
        })
        .reduce((total, sub) => {
          return total + calculateMonthlyAmount(sub.cost, sub.billing_cycle);
        }, 0);

      months.push({
        name: monthName,
        amount: Math.round(monthSpending),
      });
    }

    return months;
  };

  const data = generateChartData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>מגמת הוצאות</CardTitle>
        <CardDescription>הוצאות חודשיות ב-6 החודשים האחרונים</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: any) => [`₪${value}`, "הוצאה חודשית"]}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
