import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { code, action } = await req.json();

    if (action === 'exchange') {
      // Exchange authorization code for tokens
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
        const error = await tokenResponse.text();
        console.error('Token exchange error:', error);
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();
      
      // Get user's email
      const profileResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const profile = await profileResponse.json();

      // Store tokens in database
      const { error: insertError } = await supabaseClient
        .from('gmail_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          email_address: profile.emailAddress,
        }, {
          onConflict: 'user_id',
        });

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ success: true, email: profile.emailAddress }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'refresh') {
      // Refresh access token
      const { data: tokenData } = await supabaseClient
        .from('gmail_tokens')
        .select('refresh_token')
        .eq('user_id', user.id)
        .single();

      if (!tokenData) {
        throw new Error('No refresh token found');
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: tokenData.refresh_token,
          client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokens = await tokenResponse.json();

      // Update token in database
      const { error: updateError } = await supabaseClient
        .from('gmail_tokens')
        .update({
          access_token: tokens.access_token,
          token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, access_token: tokens.access_token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'disconnect') {
      // Revoke tokens and delete from database
      const { data: tokenData } = await supabaseClient
        .from('gmail_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .single();

      if (tokenData) {
        // Revoke token with Google
        await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenData.access_token}`, {
          method: 'POST',
        });

        // Delete from database
        await supabaseClient
          .from('gmail_tokens')
          .delete()
          .eq('user_id', user.id);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error: any) {
    console.error('Error in gmail-oauth function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
