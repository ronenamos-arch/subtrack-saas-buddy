import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription } from "@/hooks/useSubscriptions";
import { getUpcomingRenewals, getDaysUntilRenewal } from "@/lib/subscriptionCalculations";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  limit?: number;
}

export const UpcomingRenewals = ({ subscriptions, limit = 5 }: UpcomingRenewalsProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const { formatCurrency } = useCurrencyConversion();
  
  const allUpcomingRenewals = getUpcomingRenewals(subscriptions, 7);
  const upcomingRenewals = showAll ? allUpcomingRenewals : allUpcomingRenewals.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          חידושים קרובים
        </CardTitle>
        <CardDescription>מנויים שמתחדשים ב-7 הימים הקרובים</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingRenewals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            אין חידושים קרובים בשבוע הקרוב
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingRenewals.map((sub) => {
              const days = getDaysUntilRenewal(sub.next_renewal_date);
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/subscriptions")}
                >
                  <div className="flex-1">
                    <div className="font-semibold">{sub.service_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(sub.next_renewal_date).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="font-semibold">{formatCurrency(sub.cost, sub.currency)}</div>
                      <Badge variant={days <= 3 ? "destructive" : "secondary"} className="text-xs">
                        {days === 0 ? "היום" : days === 1 ? "מחר" : `עוד ${days} ימים`}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {allUpcomingRenewals.length > limit && !showAll && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAll(true)}
              >
                הצג את כל {allUpcomingRenewals.length} החידושים
              </Button>
            )}
            
            {showAll && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAll(false)}
              >
                הצג פחות
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
