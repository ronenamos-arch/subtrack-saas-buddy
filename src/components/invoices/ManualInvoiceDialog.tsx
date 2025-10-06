import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Upload, X } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const ManualInvoiceDialog = () => {
  const [open, setOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [sender, setSender] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ILS");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [billingDate, setBillingDate] = useState<Date>();
  const [file, setFile] = useState<File | null>(null);
  const { addManualInvoice } = useInvoices();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceName || !amount || !billingDate) {
      return;
    }

    await addManualInvoice.mutateAsync({
      service_name: serviceName,
      sender: sender || null,
      amount: parseFloat(amount),
      currency,
      billing_cycle: billingCycle,
      billing_date: format(billingDate, "yyyy-MM-dd"),
      file: file || undefined,
    });

    // Reset form
    setServiceName("");
    setSender("");
    setAmount("");
    setCurrency("ILS");
    setBillingCycle("monthly");
    setBillingDate(undefined);
    setFile(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 ml-2" />
          הוסף חשבונית ידנית
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוסף חשבונית ידנית</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_name">שם השירות *</Label>
            <Input
              id="service_name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="לדוגמה: Netflix, Spotify"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sender">שם הספק</Label>
            <Input
              id="sender"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="שם חברת הספק"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">סכום *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">מטבע</Label>
              <Select value={currency} onValueChange={setCurrency}>
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

          <div className="space-y-2">
            <Label htmlFor="billing_cycle">מחזור חיוב</Label>
            <Select value={billingCycle} onValueChange={setBillingCycle}>
              <SelectTrigger id="billing_cycle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">חודשי</SelectItem>
                <SelectItem value="yearly">שנתי</SelectItem>
                <SelectItem value="quarterly">רבעוני</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>תאריך חיוב *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !billingDate && "text-muted-foreground"
                  )}
                >
                  {billingDate ? format(billingDate, "dd/MM/yyyy") : "בחר תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={billingDate}
                  onSelect={setBillingDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>מסמך (אופציונלי)</Label>
            {!file ? (
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="file"
                  className="flex items-center gap-2 cursor-pointer border rounded-md px-4 py-2 hover:bg-accent transition-colors w-full justify-center"
                >
                  <Upload className="h-4 w-4" />
                  העלה מסמך
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-2 border rounded-md p-2">
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={addManualInvoice.isPending}>
              {addManualInvoice.isPending ? "שומר..." : "שמור"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};