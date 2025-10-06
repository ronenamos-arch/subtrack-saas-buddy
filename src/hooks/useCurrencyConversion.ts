import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/browserClient";

// Exchange rates relative to ILS (base currency)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  ILS: { ILS: 1, USD: 0.27, EUR: 0.25 },
  USD: { ILS: 3.7, USD: 1, EUR: 0.92 },
  EUR: { ILS: 4.0, USD: 1.09, EUR: 1 },
};

export const useCurrencyConversion = () => {
  const { data: userCurrency } = useQuery({
    queryKey: ["userCurrency"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "ILS";

      const { data: profile } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .single();

      return profile?.currency || "ILS";
    },
  });

  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency?: string
  ): number => {
    const targetCurrency = toCurrency || userCurrency || "ILS";
    
    if (fromCurrency === targetCurrency) {
      return amount;
    }

    const rate = EXCHANGE_RATES[fromCurrency]?.[targetCurrency];
    if (!rate) {
      console.warn(`Exchange rate not found for ${fromCurrency} to ${targetCurrency}`);
      return amount;
    }

    return amount * rate;
  };

  const formatCurrency = (
    amount: number,
    fromCurrency: string = "ILS",
    options?: { convert?: boolean }
  ): string => {
    const shouldConvert = options?.convert !== false;
    const targetCurrency = userCurrency || "ILS";
    
    const displayAmount = shouldConvert
      ? convertCurrency(amount, fromCurrency, targetCurrency)
      : amount;

    const displayCurrency = shouldConvert ? targetCurrency : fromCurrency;

    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: displayCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(displayAmount);
  };

  return {
    userCurrency: userCurrency || "ILS",
    convertCurrency,
    formatCurrency,
  };
};
