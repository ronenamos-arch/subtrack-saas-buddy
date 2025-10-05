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

    console.log('Gmail callback received:', { 
      url: url.href,
      hasCode: !!code, 
      hasState: !!state, 
      hasError: !!error,
      allParams: Object.fromEntries(url.searchParams)
    });

    if (error) {
      console.error('OAuth error:', error);
      return Response.redirect(`${Deno.env.get('APP_URL') || 'https://preview--subtrack-saas-buddy.lovable.app'}/integrations?error=${error}`);
    }

    if (!code) {
      console.error('No authorization code received. URL:', url.href);
      throw new Error('No authorization code received');
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
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get user's Gmail profile
    const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get Gmail profile');
    }

    const profile = await profileResponse.json();

    // Parse state to get user ID (if provided)
    const userId = state;

    if (!userId) {
      throw new Error('User ID not found in state');
    }

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
      console.error('Database error:', dbError);
      throw new Error('Failed to store tokens');
    }

    // Redirect back to app
    const appUrl = Deno.env.get('APP_URL') || 'https://preview--subtrack-saas-buddy.lovable.app';
    return Response.redirect(`${appUrl}/integrations?connected=true`);

  } catch (error) {
    console.error('Error in gmail-callback:', error);
    const appUrl = Deno.env.get('APP_URL') || 'https://preview--subtrack-saas-buddy.lovable.app';
    return Response.redirect(`${appUrl}/integrations?error=auth_failed`);
  }
});
