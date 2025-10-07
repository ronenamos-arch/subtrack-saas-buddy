import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Check, X, ExternalLink, Trash2, Eye, Pencil } from "lucide-react";
import { useInvoices, Invoice } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/browserClient";
import { EditInvoiceDialog } from "./EditInvoiceDialog";

export const InvoiceList = () => {
  const { invoices, isLoading, updateInvoiceStatus, updateInvoice, deleteInvoice } = useInvoices();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const getStoragePathFromUrl = (url: string) => {
    try {
      const marker = "/invoices/";
      const idx = url.indexOf(marker);
      if (idx !== -1) return url.slice(idx + marker.length);
      return url;
    } catch {
      return url;
    }
  };

  const getSignedUrl = async (urlOrPath: string) => {
    try {
      const path = urlOrPath.startsWith("http") ? getStoragePathFromUrl(urlOrPath) : urlOrPath;
      const { data, error } = await supabase.storage
        .from("invoices")
        .createSignedUrl(path, 600);
      if (error) throw error;
      return data.signedUrl;
    } catch (e) {
      console.error("Failed to create signed URL", e);
      return urlOrPath;
    }
  };

  const handlePreview = async (invoice: any) => {
    if (!invoice.pdf_url) return;
    const signed = await getSignedUrl(invoice.pdf_url);
    setPreviewUrl(signed);
  };

  const handleOpenNew = async (invoice: any) => {
    if (!invoice.pdf_url) return;
    const signed = await getSignedUrl(invoice.pdf_url);
    window.open(signed, "_blank");
  };

  const handleEditSave = (data: Partial<Invoice>) => {
    if (!editingInvoice) return;
    updateInvoice.mutate({ id: editingInvoice.id, data });
    setEditingInvoice(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "ממתין לאישור", variant: "secondary" as const },
      approved: { label: "אושר", variant: "default" as const },
      ignored: { label: "התעלם", variant: "outline" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (isLoading) {
    return <div className="text-center py-8">טוען חשבוניות...</div>;
  }

  if (!invoices.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">עדיין לא הועלו חשבוניות</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {invoices.map((invoice) => {
          const status = getStatusBadge(invoice.status);
          const isPdf = invoice.pdf_url?.toLowerCase().endsWith('.pdf');
          
          return (
            <Card key={invoice.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Preview Thumbnail */}
                  {invoice.pdf_url && (
                    <div className="flex-shrink-0">
                      <div 
                        className="w-32 h-40 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handlePreview(invoice)}
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
                        className="w-full mt-2"
                        onClick={() => setPreviewUrl(invoice.pdf_url!)}
                      >
                        <Eye className="h-3 w-3 ml-1" />
                        הגדל
                      </Button>
                    </div>
                  )}

                  {/* Invoice Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">
                            {invoice.service_name || "ללא שם"}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.sender && `מאת: ${invoice.sender} • `}
                          {invoice.created_at && format(new Date(invoice.created_at), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {invoice.amount && (
                        <div>
                          <span className="text-muted-foreground">סכום: </span>
                          <span className="font-medium">
                            {invoice.amount} {invoice.currency}
                          </span>
                        </div>
                      )}
                      {invoice.billing_cycle && (
                        <div>
                          <span className="text-muted-foreground">מחזור חיוב: </span>
                          <span className="font-medium">{invoice.billing_cycle}</span>
                        </div>
                      )}
                      {invoice.billing_date && (
                        <div>
                          <span className="text-muted-foreground">תאריך חיוב: </span>
                          <span className="font-medium">
                            {format(new Date(invoice.billing_date), "dd/MM/yyyy")}
                          </span>
                        </div>
                      )}
                    </div>

                    {invoice.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateInvoiceStatus.mutate({ id: invoice.id, status: "approved" })}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 ml-2" />
                          אשר
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInvoiceStatus.mutate({ id: invoice.id, status: "ignored" })}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 ml-2" />
                          התעלם
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingInvoice(invoice)}
                        className="flex-1"
                      >
                        <Pencil className="h-4 w-4 ml-2" />
                        ערוך
                      </Button>
                      {invoice.pdf_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(invoice.pdf_url!, "_blank")}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 ml-2" />
                          פתח בחלון חדש
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteInvoice.mutate(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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

      {/* Edit Invoice Dialog */}
      <EditInvoiceDialog
        invoice={editingInvoice}
        open={editingInvoice !== null}
        onOpenChange={(open) => !open && setEditingInvoice(null)}
        onSave={handleEditSave}
      />
    </>
  );
};