import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Subscription } from "@/hooks/useSubscriptions";
import { calculateMonthlyAmount } from "@/lib/subscriptionCalculations";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";

interface CategoryBreakdownProps {
  subscriptions: Subscription[];
}

export const CategoryBreakdown = ({ subscriptions }: CategoryBreakdownProps) => {
  const { convertCurrency, formatCurrency, userCurrency } = useCurrencyConversion();

  const generateCategoryData = () => {
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();

    subscriptions
      .filter((sub) => sub.status === "active")
      .forEach((sub) => {
        const categoryName = sub.categories?.name || "ללא קטגוריה";
        const categoryColor = sub.categories?.color || "#94a3b8";
        const monthlyAmount = calculateMonthlyAmount(sub.cost, sub.billing_cycle);
        const convertedAmount = convertCurrency(monthlyAmount, sub.currency);

        if (categoryMap.has(categoryName)) {
          const existing = categoryMap.get(categoryName)!;
          existing.value += convertedAmount;
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            value: convertedAmount,
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
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>פילוח הוצאות לפי קטגוריה</CardTitle>
          <CardDescription>הוצאות חודשיות לפי קטגוריות</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            אין נתונים להצגה
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle>פילוח הוצאות לפי קטגוריה</CardTitle>
        <CardDescription>הוצאות חודשיות לפי קטגוריות</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius + 40;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                
                return (
                  <text 
                    x={x} 
                    y={y} 
                    fill="hsl(var(--foreground))"
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="central"
                    className="text-sm font-medium"
                  >
                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                  </text>
                );
              }}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatCurrency(value as number, userCurrency, { convert: false }), "הוצאה חודשית"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "white",
                fontWeight: "600",
              }}
              labelStyle={{
                color: "white",
                fontWeight: "600",
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: "20px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
