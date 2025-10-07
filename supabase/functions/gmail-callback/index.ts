import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    const APP_URL = Deno.env.get('APP_URL') || 'https://preview--subtrack-saas-buddy.lovable.app';
    
    console.log('OAuth callback received', { hasCode: !!code, hasState: !!state, error });

    if (error) {
      console.error('OAuth callback error received');
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    // Validate authorization code
    if (!code || typeof code !== 'string') {
      console.error('Invalid request');
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }
    
    // Validate state parameter format (should be userId:csrfToken:timestamp)
    if (!state || typeof state !== 'string') {
      console.error('Invalid request');
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    // Parse state token
    const stateParts = state.split(':');
    if (stateParts.length !== 3) {
      console.error('Invalid request');
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    const [userId, csrfToken, timestampStr] = stateParts;
    const timestamp = parseInt(timestampStr, 10);

    // Validate timestamp (reject if older than 5 minutes - reduced for security)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (isNaN(timestamp) || timestamp < fiveMinutesAgo) {
      console.error('State validation failed');
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    // Validate UUID format for userId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('Invalid request');
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    // Connect to Supabase to validate CSRF token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify CSRF token from database
    const { data: pendingState, error: stateError } = await supabase
      .from('oauth_pending_states')
      .select('*')
      .eq('state_token', state)
      .eq('user_id', userId)
      .eq('csrf_token', csrfToken)
      .eq('used', false)
      .single();

    if (stateError || !pendingState) {
      console.error('State validation failed');
      // Audit log failed validation
      await supabase.from('oauth_audit_log').insert({
        user_id: userId,
        event_type: 'oauth_csrf_validation_failed',
        event_details: { error: 'validation_failed' },
      });
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    // Check if state is expired
    const stateExpiresAt = new Date(pendingState.expires_at);
    if (stateExpiresAt < new Date()) {
      console.error('State validation failed');
      await supabase.from('oauth_audit_log').insert({
        user_id: userId,
        event_type: 'oauth_state_expired',
        event_details: {},
      });
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    // Mark state as used to prevent replay attacks
    await supabase
      .from('oauth_pending_states')
      .update({ used: true })
      .eq('id', pendingState.id);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
        redirect_uri: Deno.env.get('GOOGLE_REDIRECT_URI'),
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed');
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    const tokens = await tokenResponse.json();

    // Audit log successful token exchange
    await supabase.from('oauth_audit_log').insert({
      user_id: userId,
      event_type: 'oauth_token_exchange_success',
      event_details: { provider: 'google_gmail' },
    });

    // Get user's Gmail profile
    const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('Profile fetch failed');
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    const profile = await profileResponse.json();

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('gmail_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: expiresAt,
        email_address: profile.emailAddress,
      });

    if (dbError) {
      console.error('Storage operation failed');
      await supabase.from('oauth_audit_log').insert({
        user_id: userId,
        event_type: 'oauth_token_storage_failed',
        event_details: {},
      });
      return Response.redirect(`${APP_URL}/integrations?status=error`);
    }

    // Audit log successful Gmail connection
    await supabase.from('oauth_audit_log').insert({
      user_id: userId,
      event_type: 'gmail_connected',
      event_details: { provider: 'google_gmail', email: profile.emailAddress },
    });

    // Redirect back to app with success
    return Response.redirect(`${APP_URL}/integrations?status=success`);

  } catch (error) {
    console.error('OAuth callback processing failed');
    const APP_URL = Deno.env.get('APP_URL') || 'https://preview--subtrack-saas-buddy.lovable.app';
    return Response.redirect(`${APP_URL}/integrations?status=error`);
  }
});