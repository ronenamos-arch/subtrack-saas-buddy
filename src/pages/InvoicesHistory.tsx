import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/useInvoices";
import { FileText, Download, Trash2, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const InvoicesHistory = () => {
  const { invoices, isLoading } = useInvoices();
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async (pdfUrl: string, fileName: string) => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "הורדה הושלמה",
        description: "הקובץ הורד בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה בהורדה",
        description: "לא ניתן להוריד את הקובץ",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteInvoiceId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", deleteInvoiceId);

      if (error) throw error;

      toast({
        title: "החשבונית נמחקה",
        description: "החשבונית הוסרה בהצלחה מהמערכת",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה במחיקה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteInvoiceId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "ממתין", variant: "secondary" as const },
      matched: { label: "מותאם", variant: "default" as const },
      ignored: { label: "התעלם", variant: "outline" as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-4xl font-bold">היסטוריית חשבוניות</h1>
          <p className="text-muted-foreground">כל החשבוניות שהועלו למערכת</p>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>אין חשבוניות עדיין</CardTitle>
              <CardDescription>
                החשבוניות שתעלה יופיעו כאן
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-24 w-24 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-semibold mb-2">לא נמצאו חשבוניות</p>
                <p className="text-sm text-muted-foreground mb-6">
                  לך לעמוד החשבוניות כדי להעלות חשבונית ראשונה
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {invoice.service_name || "ללא שם"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        {invoice.sender && (
                          <span className="flex items-center gap-1">
                            <span className="text-xs">שולח:</span>
                            {invoice.sender}
                          </span>
                        )}
                        {invoice.subject && (
                          <span className="flex items-center gap-1">
                            <span className="text-xs">נושא:</span>
                            {invoice.subject}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {getStatusBadge(invoice.status || "pending")}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    {invoice.amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">סכום</p>
                          <p className="font-semibold">
                            {new Intl.NumberFormat("he-IL", {
                              style: "currency",
                              currency: invoice.currency || "ILS",
                            }).format(invoice.amount)}
                          </p>
                        </div>
                      </div>
                    )}
                    {invoice.billing_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">תאריך חיוב</p>
                          <p className="font-semibold">
                            {new Date(invoice.billing_date).toLocaleDateString("he-IL")}
                          </p>
                        </div>
                      </div>
                    )}
                    {invoice.billing_cycle && (
                      <div>
                        <p className="text-xs text-muted-foreground">מחזור חיוב</p>
                        <p className="font-semibold">
                          {invoice.billing_cycle === "monthly"
                            ? "חודשי"
                            : invoice.billing_cycle === "yearly"
                            ? "שנתי"
                            : invoice.billing_cycle === "quarterly"
                            ? "רבעוני"
                            : invoice.billing_cycle}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {invoice.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            invoice.pdf_url!,
                            `invoice-${invoice.id}.pdf`
                          )
                        }
                      >
                        <Download className="h-4 w-4 ml-2" />
                        הורד
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteInvoiceId(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      מחק
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog
          open={deleteInvoiceId !== null}
          onOpenChange={() => setDeleteInvoiceId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו תמחק את החשבונית לצמיתות. לא ניתן לבטל פעולה זו.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "מוחק..." : "מחק"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default InvoicesHistory;
