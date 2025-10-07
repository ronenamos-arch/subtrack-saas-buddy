-- Restrict cleanup_expired_oauth_states function to service role only
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_oauth_states() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_oauth_states() FROM anon;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_oauth_states() TO service_role;

-- Add comment explaining the security restriction
COMMENT ON FUNCTION public.cleanup_expired_oauth_states() IS 'Restricted to service_role only - should be called by scheduled jobs';