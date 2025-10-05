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

    const { daysBack = 365 } = await req.json().catch(() => ({}));

    // Get user's Gmail token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Gmail not connected');
    }

    // Check if token needs refresh
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.token_expiry) < new Date()) {
      const refreshResponse = await supabaseClient.functions.invoke('gmail-oauth', {
        body: { action: 'refresh' },
      });
      accessToken = refreshResponse.data.access_token;
    }

    // Get scan rules
    const { data: rules } = await supabaseClient
      .from('email_scan_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('enabled', true);

    // Calculate date for filtering
    const afterDate = new Date();
    afterDate.setDate(afterDate.getDate() - daysBack);
    const afterDateStr = Math.floor(afterDate.getTime() / 1000);

    // Build Gmail query
    let query = `after:${afterDateStr} has:attachment (subject:invoice OR subject:חשבונית OR subject:receipt OR subject:קבלה)`;
    
    if (rules && rules.length > 0) {
      const senderFilters = rules
        .filter(r => r.sender_filter)
        .map(r => `from:${r.sender_filter}`)
        .join(' OR ');
      
      if (senderFilters) {
        query += ` (${senderFilters})`;
      }
    }

    console.log('Gmail query:', query);

    // Search emails
    const searchResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=100`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to search emails');
    }

    const searchData = await searchResponse.json();
    const messages = searchData.messages || [];

    console.log(`Found ${messages.length} messages`);

    let processedCount = 0;
    let suggestionsCreated = 0;

    // Process each message
    for (const message of messages) {
      try {
        // Get full message details
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!msgResponse.ok) continue;

        const msgData = await msgResponse.json();
        const headers = msgData.payload.headers;
        
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
        const from = headers.find((h: any) => h.name === 'From')?.value || '';
        const date = headers.find((h: any) => h.name === 'Date')?.value;

        // Check for attachments
        const parts = msgData.payload.parts || [];
        let attachmentFound = false;

        for (const part of parts) {
          if (part.filename && (
            part.filename.toLowerCase().endsWith('.pdf') ||
            part.filename.toLowerCase().match(/\.(jpg|jpeg|png)$/)
          )) {
            attachmentFound = true;

            // Get attachment data
            const attachmentResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/attachments/${part.body.attachmentId}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (!attachmentResponse.ok) continue;

            const attachmentData = await attachmentResponse.json();
            
            // Convert base64url to base64
            const base64Data = attachmentData.data.replace(/-/g, '+').replace(/_/g, '/');
            
            // Decode and upload to storage
            const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const blob = new Blob([binaryData]);
            
            const fileName = `${user.id}/${Date.now()}_${part.filename}`;
            const { error: uploadError } = await supabaseClient.storage
              .from('invoices')
              .upload(fileName, blob);

            if (uploadError) {
              console.error('Upload error:', uploadError);
              continue;
            }

            // Get signed URL for parsing
            const { data: signedUrlData } = await supabaseClient.storage
              .from('invoices')
              .createSignedUrl(fileName, 3600);

            if (!signedUrlData) continue;

            // Parse invoice
            const { data: parseData } = await supabaseClient.functions.invoke('parse-invoice', {
              body: { fileUrl: signedUrlData.signedUrl, fileName: part.filename },
            });

            if (!parseData?.data) continue;

            const parsed = parseData.data;

            // Get public URL
            const { data: { publicUrl } } = supabaseClient.storage
              .from('invoices')
              .getPublicUrl(fileName);

            // Create invoice record
            const { data: invoice } = await supabaseClient
              .from('invoices')
              .insert({
                user_id: user.id,
                email_id: message.id,
                sender: from,
                subject: subject,
                received_date: date ? new Date(date).toISOString() : null,
                pdf_url: publicUrl,
                service_name: parsed.service_name,
                amount: parsed.amount,
                currency: parsed.currency || 'ILS',
                billing_date: parsed.billing_date,
                billing_cycle: parsed.billing_cycle,
                parsed_data: parsed,
                status: 'pending',
              })
              .select()
              .single();

            if (invoice) {
              // Check for existing subscription (duplicate detection)
              const { data: existingSub } = await supabaseClient
                .from('subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .eq('service_name', parsed.service_name)
                .eq('cost', parsed.amount)
                .maybeSingle();

              // Calculate next renewal date
              let nextRenewal = new Date(parsed.billing_date || new Date());
              if (parsed.billing_cycle === 'monthly') {
                nextRenewal.setMonth(nextRenewal.getMonth() + 1);
              } else if (parsed.billing_cycle === 'yearly') {
                nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
              }

              // Create suggestion
              const { error: suggestionError } = await supabaseClient
                .from('subscription_suggestions')
                .insert({
                  user_id: user.id,
                  invoice_id: invoice.id,
                  service_name: parsed.service_name,
                  vendor: parsed.sender,
                  amount: parsed.amount,
                  currency: parsed.currency || 'ILS',
                  billing_cycle: parsed.billing_cycle,
                  next_renewal_date: nextRenewal.toISOString().split('T')[0],
                  duplicate_of: existingSub?.id || null,
                  confidence_score: 0.85,
                });

              if (!suggestionError) {
                suggestionsCreated++;
              }
            }

            processedCount++;
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        messagesFound: messages.length,
        invoicesProcessed: processedCount,
        suggestionsCreated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in scan-gmail function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
