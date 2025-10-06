import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/browserClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, Trash2, Plus, Eye, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { AddSubscriptionDialog } from "@/components/subscriptions/AddSubscriptionDialog";
import { DeleteConfirmDialog } from "@/components/subscriptions/DeleteConfirmDialog";
import { SubscriptionFilters } from "@/components/subscriptions/SubscriptionFilters";
import { exportSubscriptionsToExcel } from "@/lib/exportToExcel";
import {
  getBillingCycleLabel,
  getDaysUntilRenewal,
  calculateMonthlyAmount,
} from "@/lib/subscriptionCalculations";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";

const Subscriptions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("renewal-asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<any>(null);

  const { subscriptions, isLoading, deleteSubscription } = useSubscriptions();
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

  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter((sub) => {
      const matchesSearch =
        sub.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || sub.category_id === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "renewal-asc":
          return new Date(a.next_renewal_date).getTime() - new Date(b.next_renewal_date).getTime();
        case "renewal-desc":
          return new Date(b.next_renewal_date).getTime() - new Date(a.next_renewal_date).getTime();
        case "cost-asc":
          return calculateMonthlyAmount(a.cost, a.billing_cycle) - calculateMonthlyAmount(b.cost, b.billing_cycle);
        case "cost-desc":
          return calculateMonthlyAmount(b.cost, b.billing_cycle) - calculateMonthlyAmount(a.cost, a.billing_cycle);
        case "name-asc":
          return a.service_name.localeCompare(b.service_name, "he");
        case "name-desc":
          return b.service_name.localeCompare(a.service_name, "he");
        default:
          return 0;
      }
    });

    return sorted;
  }, [subscriptions, searchQuery, statusFilter, categoryFilter, sortBy]);

  const handleDelete = async () => {
    if (subscriptionToDelete) {
      await deleteSubscription.mutateAsync(subscriptionToDelete.id);
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    }
  };

  const handleExport = () => {
    exportSubscriptionsToExcel(filteredSubscriptions);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: "default",
      paused: "secondary",
      cancelled: "destructive",
    };
    const labels: Record<string, string> = {
      active: "פעיל",
      paused: "מושהה",
      cancelled: "בוטל",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getRenewalBadge = (renewalDate: string) => {
    const days = getDaysUntilRenewal(renewalDate);
    if (days < 0) return <Badge variant="destructive">פג תוקף</Badge>;
    if (days <= 3) return <Badge variant="destructive">{days} ימים</Badge>;
    if (days <= 7) return <Badge variant="secondary">{days} ימים</Badge>;
    return <span className="text-muted-foreground">{days} ימים</span>;
  };

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold">המנויים שלי</h1>
            <p className="text-muted-foreground">נהל את כל המנויים שלך במקום אחד</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={filteredSubscriptions.length === 0}>
              <Download className="ml-2 h-4 w-4" />
              ייצוא לאקסל
            </Button>
            <AddSubscriptionDialog />
          </div>
        </div>

        <Card>
          <CardHeader>
            <SubscriptionFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </CardHeader>
          <CardContent>
            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Plus className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">
                    {subscriptions.length === 0 ? "אין מנויים עדיין" : "לא נמצאו תוצאות"}
                  </p>
                  <p className="text-sm mb-4">
                    {subscriptions.length === 0
                      ? "התחל על ידי הוספת המנוי הראשון שלך"
                      : "נסה לשנות את הפילטרים או החיפוש"}
                  </p>
                  {subscriptions.length === 0 && <AddSubscriptionDialog />}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right w-[60px]">לוגו</TableHead>
                      <TableHead className="text-right">שם השירות</TableHead>
                      <TableHead className="text-right">ספק</TableHead>
                      <TableHead className="text-right">עלות חודשית</TableHead>
                      <TableHead className="text-right">עלות</TableHead>
                      <TableHead className="text-right">תדירות</TableHead>
                      <TableHead className="text-right">חידוש הבא</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">קטגוריה</TableHead>
                      <TableHead className="text-right">רישיונות</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sub.logo_url || undefined} alt={sub.service_name} />
                            <AvatarFallback>
                              <Building2 className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{sub.service_name}</TableCell>
                        <TableCell>
                          {sub.vendor ? (
                            <span className="text-sm">{sub.vendor}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            calculateMonthlyAmount(sub.cost, sub.billing_cycle),
                            sub.currency
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(sub.cost, sub.currency)}</TableCell>
                        <TableCell>{getBillingCycleLabel(sub.billing_cycle)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">
                              {new Date(sub.next_renewal_date).toLocaleDateString("he-IL")}
                            </span>
                            {getRenewalBadge(sub.next_renewal_date)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell>
                          {sub.categories ? (
                            <Badge
                              variant="outline"
                              style={{ borderColor: sub.categories.color }}
                            >
                              {sub.categories.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {sub.licenses_used}/{sub.licenses_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {sub.website_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(sub.website_url!, "_blank")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <AddSubscriptionDialog
                              subscription={sub}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSubscriptionToDelete(sub);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        serviceName={subscriptionToDelete?.service_name || ""}
      />
    </DashboardLayout>
  );
};

export default Subscriptions;