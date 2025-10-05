-- Create email scan rules table
CREATE TABLE IF NOT EXISTS public.email_scan_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_filter TEXT,
  subject_filter TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_scan_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own rules"
  ON public.email_scan_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules"
  ON public.email_scan_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules"
  ON public.email_scan_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules"
  ON public.email_scan_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Create subscription suggestions table
CREATE TABLE IF NOT EXISTS public.subscription_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  vendor TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'ILS',
  billing_cycle TEXT NOT NULL,
  next_renewal_date DATE NOT NULL,
  confidence_score NUMERIC DEFAULT 0.8,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  duplicate_of UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own suggestions"
  ON public.subscription_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suggestions"
  ON public.subscription_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
  ON public.subscription_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own suggestions"
  ON public.subscription_suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_email_scan_rules_updated_at
  BEFORE UPDATE ON public.email_scan_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscription_suggestions_updated_at
  BEFORE UPDATE ON public.subscription_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add index for performance
CREATE INDEX idx_email_scan_rules_user_id ON public.email_scan_rules(user_id);
CREATE INDEX idx_subscription_suggestions_user_id ON public.subscription_suggestions(user_id);
CREATE INDEX idx_subscription_suggestions_status ON public.subscription_suggestions(status);
CREATE INDEX idx_subscription_suggestions_duplicate ON public.subscription_suggestions(duplicate_of);