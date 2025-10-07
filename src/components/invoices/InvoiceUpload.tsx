import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInvoices } from "@/hooks/useInvoices";

interface InvoiceUploadProps {
  onUploadSuccess?: () => void;
}

export const InvoiceUpload = ({ onUploadSuccess }: InvoiceUploadProps) => {
  const { uploadInvoice } = useInvoices();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      alert('נא להעלות קובץ PDF או תמונה');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('גודל הקובץ חורג מ-10MB');
      return;
    }

    uploadInvoice.mutate(file, {
      onSuccess: () => {
        onUploadSuccess?.();
      }
    });
  };

  return (
    <Card className="max-w-sm w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          העלאת חשבונית
        </CardTitle>
        <CardDescription>
          העלה קובץ PDF או תמונה של חשבונית לניתוח אוטומטי
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-4 text-center max-w-xs mx-auto">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
              id="invoice-upload"
              disabled={uploadInvoice.isPending}
            />
            <label htmlFor="invoice-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground mb-2">
                לחץ להעלאה או גרור קובץ לכאן
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, PNG, JPG עד 10MB
              </p>
            </label>
          </div>
          <Button 
            onClick={() => document.getElementById('invoice-upload')?.click()}
            disabled={uploadInvoice.isPending}
            className="w-full h-9"
          >
            {uploadInvoice.isPending ? "מעלה..." : "בחר קובץ"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};