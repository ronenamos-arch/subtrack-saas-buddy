import { Subscription } from "@/hooks/useSubscriptions";
import { calculateMonthlyAmount, calculateYearlyAmount, formatCurrency, getBillingCycleLabel } from "./subscriptionCalculations";

export const exportSubscriptionsToExcel = (subscriptions: Subscription[]) => {
  // Create CSV content
  const headers = [
    "שם השירות",
    "עלות",
    "מטבע",
    "תדירות",
    "עלות חודשית",
    "עלות שנתית",
    "תאריך התחלה",
    "חידוש הבא",
    "סטטוס",
    "קטגוריה",
    "רישיונות",
    "בשימוש",
    "הערות",
    "אתר",
  ];

  const rows = subscriptions.map((sub) => [
    sub.service_name,
    sub.cost,
    sub.currency,
    getBillingCycleLabel(sub.billing_cycle),
    calculateMonthlyAmount(sub.cost, sub.billing_cycle).toFixed(2),
    calculateYearlyAmount(sub.cost, sub.billing_cycle).toFixed(2),
    sub.start_date,
    sub.next_renewal_date,
    sub.status === "active" ? "פעיל" : sub.status === "paused" ? "מושהה" : "בוטל",
    sub.categories?.name || "",
    sub.licenses_count,
    sub.licenses_used,
    sub.notes || "",
    sub.website_url || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  // Add BOM for Hebrew support
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `subscriptions_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
