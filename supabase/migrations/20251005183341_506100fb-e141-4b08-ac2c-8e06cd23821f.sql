-- Add last_login column to subscriptions table for tracking subscription usage
ALTER TABLE public.subscriptions
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add index for better query performance on last_login
CREATE INDEX idx_subscriptions_last_login ON public.subscriptions(last_login);

-- Add comment to explain the column
COMMENT ON COLUMN public.subscriptions.last_login IS 'Last time the subscription/service was accessed or used by the user';