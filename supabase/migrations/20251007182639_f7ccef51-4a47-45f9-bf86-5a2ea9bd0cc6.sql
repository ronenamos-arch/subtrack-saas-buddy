-- Add validation function for email format in sender_filter
CREATE OR REPLACE FUNCTION public.validate_email_sender_filter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If sender_filter is provided, validate it's a proper email format
  IF NEW.sender_filter IS NOT NULL AND TRIM(NEW.sender_filter) != '' THEN
    -- Validate email format using regex
    -- Allows standard email formats like: user@domain.com or domain.com
    IF NOT (NEW.sender_filter ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' 
            OR NEW.sender_filter ~* '^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$') THEN
      RAISE EXCEPTION 'Invalid sender_filter format. Must be a valid email address (user@domain.com) or domain (domain.com)';
    END IF;
    
    -- Additional security: reject special Gmail query operators
    IF NEW.sender_filter ~* '(\(|\)|OR|AND|\{|\}|\*|subject:|from:|to:|has:|in:|is:|filename:)' THEN
      RAISE EXCEPTION 'Sender filter cannot contain Gmail query operators';
    END IF;
    
    -- Limit length to prevent abuse
    IF LENGTH(NEW.sender_filter) > 255 THEN
      RAISE EXCEPTION 'Sender filter must be less than 255 characters';
    END IF;
  END IF;
  
  -- Validate subject_filter if provided
  IF NEW.subject_filter IS NOT NULL AND LENGTH(NEW.subject_filter) > 500 THEN
    RAISE EXCEPTION 'Subject filter must be less than 500 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for insert and update operations
DROP TRIGGER IF EXISTS validate_email_scan_rules_trigger ON public.email_scan_rules;
CREATE TRIGGER validate_email_scan_rules_trigger
  BEFORE INSERT OR UPDATE ON public.email_scan_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_email_sender_filter();

-- Add comment explaining the security control
COMMENT ON FUNCTION public.validate_email_sender_filter() IS 
'Security function: Validates email_scan_rules.sender_filter to prevent Gmail query injection attacks. Ensures only valid email addresses or domains are allowed, blocking special Gmail query operators.';
