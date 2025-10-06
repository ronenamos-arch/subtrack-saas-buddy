-- Fix storage bucket RLS policies for invoices
-- Ensure users can only access their own invoice files

-- Policy for viewing own invoices
CREATE POLICY "Users can only access own invoices"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for uploading to own folder
CREATE POLICY "Users can only upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating own files
CREATE POLICY "Users can only update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting own files
CREATE POLICY "Users can only delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix handle_new_user function to add input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Validate and limit full_name length
  v_full_name := COALESCE(
    SUBSTRING(NEW.raw_user_meta_data->>'full_name', 1, 200),
    ''
  );
  
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, v_full_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix handle_updated_at function to set search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;