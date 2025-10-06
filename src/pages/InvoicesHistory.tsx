import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/useInvoices";
import { FileText, Download, Trash2, Calendar, DollarSign, Eye } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/browserClient";
import { toast } from "@/hooks/use-toast";

const InvoicesHistory = () => {
  const { invoices, isLoading } = useInvoices();
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-24 w-24 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-semibold mb-2">אין חשבוניות עדיין</p>
                <p className="text-sm text-muted-foreground mb-6">
                  החשבוניות שתעלה יופיעו כאן
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => {
              const isPdf = invoice.pdf_url?.toLowerCase().endsWith('.pdf');
              
              return (
                <Card key={invoice.id} className="transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Preview Thumbnail */}
                      {invoice.pdf_url && (
                        <div className="flex-shrink-0">
                          <div 
                            className="w-32 h-40 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setPreviewUrl(invoice.pdf_url!)}
                          >
                            {isPdf ? (
                              <div className="text-center p-4">
                                <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">לחץ לצפייה</p>
                              </div>
                            ) : (
                              <img 
                                src={invoice.pdf_url} 
                                alt="Invoice preview" 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full mt-2 text-xs"
                            onClick={() => setPreviewUrl(invoice.pdf_url!)}
                          >
                            <Eye className="h-3 w-3 ml-1" />
                            הגדל
                          </Button>
                        </div>
                      )}

                      {/* Invoice Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              <h3 className="text-lg font-semibold">
                                {invoice.service_name || "ללא שם"}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {invoice.sender && (
                                <span>שולח: {invoice.sender}</span>
                              )}
                              {invoice.subject && (
                                <span>נושא: {invoice.subject}</span>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(invoice.status || "pending")}
                        </div>

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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

        {/* Preview Dialog */}
        <Dialog open={previewUrl !== null} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>תצוגת חשבונית</DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[80vh]">
              {previewUrl && (
                previewUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] border-0"
                    title="Invoice preview"
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Invoice" 
                    className="w-full h-auto"
                  />
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default InvoicesHistory;
