import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubscriptions, Subscription } from "@/hooks/useSubscriptions";
import { useCategories } from "@/hooks/useCategories";
import { calculateNextRenewalDate } from "@/lib/subscriptionCalculations";
import { Plus, Save, Settings } from "lucide-react";
import { CategoryManagementDialog } from "@/components/categories/CategoryManagementDialog";

interface AddSubscriptionDialogProps {
  subscription?: Subscription;
  trigger?: React.ReactNode;
}

export const AddSubscriptionDialog = ({ subscription, trigger }: AddSubscriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const { addSubscription, updateSubscription } = useSubscriptions();
  const { categories } = useCategories();
  const isEdit = !!subscription;

  const [formData, setFormData] = useState({
    service_name: subscription?.service_name || "",
    vendor: subscription?.vendor || "",
    logo_url: subscription?.logo_url || "",
    cost: subscription?.cost?.toString() || "",
    currency: subscription?.currency || "ILS",
    billing_cycle: subscription?.billing_cycle || "monthly",
    start_date: subscription?.start_date || new Date().toISOString().split("T")[0],
    next_renewal_date: subscription?.next_renewal_date || "",
    status: subscription?.status || "active",
    category_id: subscription?.category_id || "none",
    licenses_count: subscription?.licenses_count?.toString() || "1",
    licenses_used: subscription?.licenses_used?.toString() || "0",
    notes: subscription?.notes || "",
    website_url: subscription?.website_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nextRenewalDate = formData.next_renewal_date || 
      calculateNextRenewalDate(formData.start_date, formData.billing_cycle);

    const data = {
      ...formData,
      cost: parseFloat(formData.cost),
      licenses_count: parseInt(formData.licenses_count),
      licenses_used: parseInt(formData.licenses_used),
      next_renewal_date: nextRenewalDate,
      category_id: formData.category_id === "none" ? null : formData.category_id,
      vendor: formData.vendor || null,
      logo_url: formData.logo_url || null,
      notes: formData.notes || null,
      website_url: formData.website_url || null,
    };

    if (isEdit && subscription) {
      await updateSubscription.mutateAsync({ id: subscription.id, ...data });
    } else {
      await addSubscription.mutateAsync(data as any);
    }
    
    setOpen(false);
    if (!isEdit) {
      setFormData({
        service_name: "",
        vendor: "",
        logo_url: "",
        cost: "",
        currency: "ILS",
        billing_cycle: "monthly",
        start_date: new Date().toISOString().split("T")[0],
        next_renewal_date: "",
        status: "active",
        category_id: "none",
        licenses_count: "1",
        licenses_used: "0",
        notes: "",
        website_url: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            הוסף מנוי
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">{isEdit ? "ערוך מנוי" : "הוסף מנוי חדש"}</DialogTitle>
          <DialogDescription className="text-right">
            {isEdit ? "עדכן את פרטי המנוי" : "הוסף מנוי חדש למערכת"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_name">שם השירות *</Label>
              <Input
                id="service_name"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                placeholder="לדוגמה: Netflix, Microsoft 365"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">ספק/יצרן</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="לדוגמה: Microsoft, Google"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="logo_url">כתובת לוגו</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">עלות *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">מטבע</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">₪ שקל</SelectItem>
                  <SelectItem value="USD">$ דולר</SelectItem>
                  <SelectItem value="EUR">€ יורו</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle">תדירות תשלום *</Label>
              <Select value={formData.billing_cycle} onValueChange={(value: any) => setFormData({ ...formData, billing_cycle: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">חודשי</SelectItem>
                  <SelectItem value="quarterly">רבעוני</SelectItem>
                  <SelectItem value="yearly">שנתי</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">תאריך התחלה *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_renewal_date">חידוש הבא</Label>
              <Input
                id="next_renewal_date"
                type="date"
                value={formData.next_renewal_date}
                onChange={(e) => setFormData({ ...formData, next_renewal_date: e.target.value })}
                placeholder="יחושב אוטומטית"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="paused">מושהה</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category_id">קטגוריה</Label>
                <CategoryManagementDialog />
              </div>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ללא קטגוריה</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenses_count">מספר רישיונות</Label>
              <Input
                id="licenses_count"
                type="number"
                value={formData.licenses_count}
                onChange={(e) => setFormData({ ...formData, licenses_count: e.target.value })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenses_used">רישיונות בשימוש</Label>
              <Input
                id="licenses_used"
                type="number"
                value={formData.licenses_used}
                onChange={(e) => setFormData({ ...formData, licenses_used: e.target.value })}
                min="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website_url">אתר השירות</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות נוספות..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ביטול
            </Button>
            <Button type="submit">
              {isEdit ? (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  שמור שינויים
                </>
              ) : (
                <>
                  <Plus className="ml-2 h-4 w-4" />
                  הוסף מנוי
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
