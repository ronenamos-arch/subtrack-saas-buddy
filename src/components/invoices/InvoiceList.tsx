import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Check, X, ExternalLink, Trash2 } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { format } from "date-fns";

export const InvoiceList = () => {
  const { invoices, isLoading, updateInvoiceStatus, deleteInvoice } = useInvoices();

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
    <div className="space-y-4">
      {invoices.map((invoice) => {
        const status = getStatusBadge(invoice.status);
        return (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {invoice.service_name || "ללא שם"}
                  </CardTitle>
                  <CardDescription>
                    {invoice.sender && `מאת: ${invoice.sender} • `}
                    {invoice.created_at && format(new Date(invoice.created_at), "dd/MM/yyyy")}
                  </CardDescription>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                  {invoice.pdf_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(invoice.pdf_url!, "_blank")}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 ml-2" />
                      צפה בקובץ
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};