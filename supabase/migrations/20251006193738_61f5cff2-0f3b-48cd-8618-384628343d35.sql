-- Create table for pending OAuth states to prevent CSRF attacks
CREATE TABLE public.oauth_pending_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  state_token text NOT NULL UNIQUE,
  csrf_token text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.oauth_pending_states ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own pending states"
ON public.oauth_pending_states FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pending states"
ON public.oauth_pending_states FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can update pending states"
ON public.oauth_pending_states FOR UPDATE
TO authenticated
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_oauth_states_token ON public.oauth_pending_states(state_token);
CREATE INDEX idx_oauth_states_expires ON public.oauth_pending_states(expires_at);

-- Create audit log table for OAuth operations
CREATE TABLE public.oauth_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oauth_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins or system can view audit logs
CREATE POLICY "Service can insert audit logs"
ON public.oauth_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for audit log queries
CREATE INDEX idx_oauth_audit_user ON public.oauth_audit_log(user_id, created_at DESC);
CREATE INDEX idx_oauth_audit_event ON public.oauth_audit_log(event_type, created_at DESC);

-- Function to cleanup expired OAuth states (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.oauth_pending_states
  WHERE expires_at < now() OR (used = true AND created_at < now() - interval '1 hour');
END;
$$;