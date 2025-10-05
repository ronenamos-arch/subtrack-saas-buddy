import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Subscription } from "@/hooks/useSubscriptions";
import { calculateMonthlyAmount } from "@/lib/subscriptionCalculations";

interface CategoryBreakdownProps {
  subscriptions: Subscription[];
}

export const CategoryBreakdown = ({ subscriptions }: CategoryBreakdownProps) => {
  const generateCategoryData = () => {
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();

    subscriptions
      .filter((sub) => sub.status === "active")
      .forEach((sub) => {
        const categoryName = sub.categories?.name || "ללא קטגוריה";
        const categoryColor = sub.categories?.color || "#94a3b8";
        const monthlyAmount = calculateMonthlyAmount(sub.cost, sub.billing_cycle);

        if (categoryMap.has(categoryName)) {
          const existing = categoryMap.get(categoryName)!;
          existing.value += monthlyAmount;
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            value: monthlyAmount,
            color: categoryColor,
          });
        }
      });

    return Array.from(categoryMap.values()).map((item) => ({
      ...item,
      value: Math.round(item.value),
    }));
  };

  const data = generateCategoryData();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>פילוח לפי קטגוריה</CardTitle>
          <CardDescription>הוצאות חודשיות לפי קטגוריות</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            אין נתונים להצגה
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>פילוח לפי קטגוריה</CardTitle>
        <CardDescription>הוצאות חודשיות לפי קטגוריות</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`₪${value}`, "הוצאה חודשית"]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
