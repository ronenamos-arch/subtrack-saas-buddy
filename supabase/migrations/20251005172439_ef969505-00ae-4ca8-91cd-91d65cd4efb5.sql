-- Create invoices table for storing scanned invoices from email
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_id TEXT,
  sender TEXT,
  subject TEXT,
  received_date TIMESTAMP WITH TIME ZONE,
  amount NUMERIC,
  currency TEXT DEFAULT 'ILS',
  service_name TEXT,
  billing_date DATE,
  billing_cycle TEXT,
  pdf_url TEXT,
  parsed_data JSONB,
  status TEXT DEFAULT 'pending',
  subscription_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" 
ON public.invoices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" 
ON public.invoices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create gmail_tokens table for storing OAuth tokens
CREATE TABLE public.gmail_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  email_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for gmail_tokens
CREATE POLICY "Users can view their own tokens" 
ON public.gmail_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" 
ON public.gmail_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" 
ON public.gmail_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" 
ON public.gmail_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gmail_tokens_updated_at
BEFORE UPDATE ON public.gmail_tokens
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for invoice PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', false);

-- Create policies for invoice PDFs
CREATE POLICY "Users can view their own invoice files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own invoice files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own invoice files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own invoice files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);