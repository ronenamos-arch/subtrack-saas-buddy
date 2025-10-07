import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Invoice } from "@/hooks/useInvoices";

interface EditInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Invoice>) => void;
}

export const EditInvoiceDialog = ({
  invoice,
  open,
  onOpenChange,
  onSave,
}: EditInvoiceDialogProps) => {
  const [formData, setFormData] = useState<Partial<Invoice>>({
    service_name: invoice?.service_name || "",
    amount: invoice?.amount || null,
    currency: invoice?.currency || "ILS",
    billing_date: invoice?.billing_date || "",
    billing_cycle: invoice?.billing_cycle || "",
    sender: invoice?.sender || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Invoice, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>עריכת חשבונית</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="service_name">שם שירות</Label>
            <Input
              id="service_name"
              value={formData.service_name || ""}
              onChange={(e) => handleChange("service_name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="sender">שולח</Label>
            <Input
              id="sender"
              value={formData.sender || ""}
              onChange={(e) => handleChange("sender", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">סכום</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount || ""}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value) || null)}
              />
            </div>

            <div>
              <Label htmlFor="currency">מטבע</Label>
              <Select
                value={formData.currency || "ILS"}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILS">ILS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="billing_date">תאריך חיוב</Label>
            <Input
              id="billing_date"
              type="date"
              value={formData.billing_date || ""}
              onChange={(e) => handleChange("billing_date", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="billing_cycle">מחזור חיוב</Label>
            <Select
              value={formData.billing_cycle || ""}
              onValueChange={(value) => handleChange("billing_cycle", value)}
            >
              <SelectTrigger id="billing_cycle">
                <SelectValue placeholder="בחר מחזור חיוב" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">חודשי</SelectItem>
                <SelectItem value="yearly">שנתי</SelectItem>
                <SelectItem value="quarterly">רבעוני</SelectItem>
                <SelectItem value="one-time">חד פעמי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit">
              שמור
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
