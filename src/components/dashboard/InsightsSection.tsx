import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription } from "@/hooks/useSubscriptions";
import { calculateMonthlyAmount } from "@/lib/subscriptionCalculations";
import { AlertCircle, Users, Copy, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InsightsSectionProps {
  subscriptions: Subscription[];
}

interface InsightCard {
  title: string;
  description: string;
  value: number;
  items: string[];
  icon: React.ElementType;
  variant: "warning" | "info" | "success";
  action?: () => void;
  actionLabel?: string;
}

export const InsightsSection = ({ subscriptions }: InsightsSectionProps) => {
  const navigate = useNavigate();

  // Unused Subscriptions (last_login > 90 days ago)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const unusedSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active" && 
    sub.last_login && 
    new Date(sub.last_login) < ninetyDaysAgo
  );

  // Unused Licenses (licenses_used < licenses_count)
  const underutilizedLicenses = subscriptions.filter(
    (sub) => sub.status === "active" && 
    sub.licenses_count > 1 && 
    sub.licenses_used < sub.licenses_count
  );

  // Overlapping Tools (same category)
  const categoryCount: Record<string, Subscription[]> = {};
  subscriptions
    .filter((sub) => sub.status === "active" && sub.category_id)
    .forEach((sub) => {
      const categoryId = sub.category_id!;
      if (!categoryCount[categoryId]) {
        categoryCount[categoryId] = [];
      }
      categoryCount[categoryId].push(sub);
    });

  const overlappingTools = Object.values(categoryCount)
    .filter((subs) => subs.length > 1)
    .flatMap((subs) => subs);

  // Potential Savings (from inactive subscriptions)
  const inactiveSubscriptions = subscriptions.filter((sub) => sub.status !== "active");
  const potentialSavings = inactiveSubscriptions.reduce(
    (total, sub) => total + calculateMonthlyAmount(sub.cost, sub.billing_cycle),
    0
  );

  const insights: InsightCard[] = [
    {
      title: "מנויים לא בשימוש",
      description: "לא נעשה בהם שימוש ב-90 הימים האחרונים",
      value: unusedSubscriptions.length,
      items: unusedSubscriptions.map((sub) => sub.service_name),
      icon: AlertCircle,
      variant: "warning",
      action: () => navigate("/subscriptions"),
      actionLabel: "סקור מנויים",
    },
    {
      title: "רישיונות לא מנוצלים",
      description: "מנויים עם רישיונות פנויים",
      value: underutilizedLicenses.length,
      items: underutilizedLicenses.map(
        (sub) => `${sub.service_name} (${sub.licenses_used}/${sub.licenses_count})`
      ),
      icon: Users,
      variant: "info",
      action: () => navigate("/subscriptions"),
      actionLabel: "נהל רישיונות",
    },
    {
      title: "כלים חופפים",
      description: "שירותים דומים באותה קטגוריה",
      value: overlappingTools.length,
      items: overlappingTools.map((sub) => `${sub.service_name} - ${sub.categories?.name || "ללא קטגוריה"}`),
      icon: Copy,
      variant: "info",
      action: () => navigate("/subscriptions"),
      actionLabel: "השווה כלים",
    },
    {
      title: "פוטנציאל חיסכון",
      description: "ממנויים לא פעילים",
      value: Math.round(potentialSavings),
      items: inactiveSubscriptions.map(
        (sub) => `${sub.service_name} - ₪${calculateMonthlyAmount(sub.cost, sub.billing_cycle)}/חודש`
      ),
      icon: TrendingDown,
      variant: "success",
      action: () => navigate("/subscriptions"),
      actionLabel: "נקה מנויים",
    },
  ];

  const hasInsights = insights.some((insight) => insight.value > 0);

  if (!hasInsights) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">תובנות חכמות</h2>
        <p className="text-muted-foreground">המלצות לחיסכון ואופטימיזציה</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight) => {
          if (insight.value === 0) return null;

          const Icon = insight.icon;
          const badgeVariant =
            insight.variant === "warning"
              ? "destructive"
              : insight.variant === "success"
              ? "default"
              : "secondary";

          return (
            <Card key={insight.title} className="transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {insight.title}
                  </CardTitle>
                  <Badge variant={badgeVariant}>{insight.value}</Badge>
                </div>
                <CardDescription className="text-xs">{insight.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insight.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-sm text-muted-foreground truncate">
                      • {item}
                    </div>
                  ))}
                  {insight.items.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      ועוד {insight.items.length - 3}...
                    </div>
                  )}
                  {insight.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={insight.action}
                    >
                      {insight.actionLabel}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
