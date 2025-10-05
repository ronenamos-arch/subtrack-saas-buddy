import { Subscription } from "@/hooks/useSubscriptions";

export const calculateMonthlyAmount = (cost: number, billing_cycle: string): number => {
  switch (billing_cycle) {
    case "monthly":
      return cost;
    case "quarterly":
      return cost / 3;
    case "yearly":
      return cost / 12;
    default:
      return cost;
  }
};

export const calculateYearlyAmount = (cost: number, billing_cycle: string): number => {
  switch (billing_cycle) {
    case "monthly":
      return cost * 12;
    case "quarterly":
      return cost * 4;
    case "yearly":
      return cost;
    default:
      return cost;
  }
};

export const calculateNextRenewalDate = (
  startDate: string,
  billing_cycle: string
): string => {
  const start = new Date(startDate);
  const today = new Date();
  
  let next = new Date(start);
  
  while (next < today) {
    switch (billing_cycle) {
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
      case "quarterly":
        next.setMonth(next.getMonth() + 3);
        break;
      case "yearly":
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
  }
  
  return next.toISOString().split("T")[0];
};

export const getDaysUntilRenewal = (renewalDate: string): number => {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffTime = renewal.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getTotalMonthlySpend = (subscriptions: Subscription[]): number => {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => {
      return total + calculateMonthlyAmount(sub.cost, sub.billing_cycle);
    }, 0);
};

export const getTotalYearlySpend = (subscriptions: Subscription[]): number => {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => {
      return total + calculateYearlyAmount(sub.cost, sub.billing_cycle);
    }, 0);
};

export const getUpcomingRenewals = (
  subscriptions: Subscription[],
  days: number = 7
): Subscription[] => {
  return subscriptions
    .filter((sub) => {
      if (sub.status !== "active") return false;
      const daysUntil = getDaysUntilRenewal(sub.next_renewal_date);
      return daysUntil >= 0 && daysUntil <= days;
    })
    .sort((a, b) => 
      new Date(a.next_renewal_date).getTime() - new Date(b.next_renewal_date).getTime()
    );
};

export const formatCurrency = (amount: number, currency: string = "ILS"): string => {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getBillingCycleLabel = (cycle: string): string => {
  const labels: Record<string, string> = {
    monthly: "חודשי",
    quarterly: "רבעוני",
    yearly: "שנתי",
  };
  return labels[cycle] || cycle;
};
