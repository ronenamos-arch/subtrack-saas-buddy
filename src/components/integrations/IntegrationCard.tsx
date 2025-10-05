import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: "available" | "coming_soon" | "beta" | "connected";
  onConnect?: () => void;
}

export const IntegrationCard = ({ title, description, icon: Icon, status, onConnect }: IntegrationCardProps) => {
  const statusLabels = {
    available: "זמין",
    coming_soon: "בקרוב",
    beta: "בטא",
    connected: "מחובר",
  };

  const statusVariants = {
    available: "default",
    coming_soon: "secondary",
    beta: "outline",
    connected: "default",
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant={statusVariants[status]} className="mt-1">
                {statusLabels[status]}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{description}</CardDescription>
        {status === "available" && onConnect && (
          <Button onClick={onConnect} className="w-full">
            התחבר
          </Button>
        )}
        {status === "connected" && onConnect && (
          <Button variant="outline" onClick={onConnect} className="w-full">
            נתק
          </Button>
        )}
        {status === "coming_soon" && (
          <Button disabled className="w-full">
            בקרוב
          </Button>
        )}
        {status === "beta" && onConnect && (
          <Button variant="outline" onClick={onConnect} className="w-full">
            נסה בטא
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
