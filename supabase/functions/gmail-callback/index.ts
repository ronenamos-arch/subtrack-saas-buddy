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
      console.error('OAuth error:', error);
      return Response.redirect(`${APP_URL}/integrations?status=error&message=oauth_error`);
    }

    // Validate authorization code
    if (!code || typeof code !== 'string') {
      console.error('Invalid authorization code');
      return Response.redirect(`${APP_URL}/integrations?status=error&message=invalid_code`);
    }
    
    // Validate state parameter format (should be user ID)
    if (!state || typeof state !== 'string') {
      console.error('Invalid state parameter');
      return Response.redirect(`${APP_URL}/integrations?status=error&message=invalid_state`);
    }

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
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status);
      return Response.redirect(`${APP_URL}/integrations?status=error&message=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();

    // Get user's Gmail profile
    const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('Failed to get Gmail profile');
      return Response.redirect(`${APP_URL}/integrations?status=error&message=profile_fetch_failed`);
    }

    const profile = await profileResponse.json();

    // Use state as user ID
    const userId = state;

    // Store tokens in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      console.error('Database error:', dbError.message);
      return Response.redirect(`${APP_URL}/integrations?status=error&message=storage_failed`);
    }

    // Redirect back to app with success
    return Response.redirect(`${APP_URL}/integrations?status=success`);

  } catch (error) {
    console.error('Error in gmail-callback:', error instanceof Error ? error.message : error);
    const APP_URL = Deno.env.get('APP_URL') || 'https://preview--subtrack-saas-buddy.lovable.app';
    return Response.redirect(`${APP_URL}/integrations?status=error&message=auth_failed`);
  }
});