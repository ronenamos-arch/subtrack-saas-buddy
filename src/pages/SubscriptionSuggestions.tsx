import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/browserClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionSuggestions } from "@/hooks/useSubscriptionSuggestions";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { Check, X, AlertTriangle } from "lucide-react";

const SubscriptionSuggestions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { suggestions, isLoading, approveSuggestion, rejectSuggestion } = useSubscriptionSuggestions();
  const { formatCurrency } = useCurrencyConversion();

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

  const getBillingCycleLabel = (cycle: string) => {
    const labels: { [key: string]: string } = {
      monthly: "חודשי",
      yearly: "שנתי",
      quarterly: "רבעוני",
    };
    return labels[cycle] || cycle;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-4xl font-bold">הצעות למנויים</h1>
          <p className="text-muted-foreground">
            מנויים שזוהו אוטומטית מחשבוניות במייל
          </p>
        </div>

        {pendingSuggestions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              אין הצעות למנויים חדשים
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              הצעות יופיעו כאן לאחר סריקת אימיילים
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {suggestion.service_name}
                      </h3>
                      {suggestion.duplicate_of && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          כפילות אפשרית
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {Math.round(suggestion.confidence_score * 100)}% בטחון
                      </Badge>
                    </div>
                    
                    {suggestion.vendor && (
                      <p className="text-sm text-muted-foreground mb-2">
                        ספק: {suggestion.vendor}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">עלות</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(suggestion.amount, suggestion.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">מחזור חיוב</p>
                        <p className="text-lg font-semibold">
                          {getBillingCycleLabel(suggestion.billing_cycle)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">חידוש הבא</p>
                        <p className="text-lg font-semibold">
                          {new Date(suggestion.next_renewal_date).toLocaleDateString("he-IL")}
                        </p>
                      </div>
                    </div>

                    {suggestion.duplicate_of && (
                      <div className="mt-4 p-3 bg-warning/10 border border-warning rounded-lg">
                        <p className="text-sm text-warning-foreground">
                          <AlertTriangle className="h-4 w-4 inline ml-1" />
                          נמצא מנוי קיים עם אותו ספק וסכום. אשר רק אם זה מנוי שונה.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mr-4">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => approveSuggestion.mutate(suggestion.id)}
                      disabled={approveSuggestion.isPending}
                      className="h-10 w-10"
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => rejectSuggestion.mutate(suggestion.id)}
                      disabled={rejectSuggestion.isPending}
                      className="h-10 w-10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionSuggestions;
