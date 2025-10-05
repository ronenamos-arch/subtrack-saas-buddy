-- Add vendor column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN vendor TEXT;

-- Add logo_url column for service logos
ALTER TABLE public.subscriptions 
ADD COLUMN logo_url TEXT;