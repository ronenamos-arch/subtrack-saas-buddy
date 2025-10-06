import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { fileUrl, fileName } = body;
    
    // Input validation
    if (!fileUrl || typeof fileUrl !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file URL provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate URL format and protocol
    try {
      const url = new URL(fileUrl);
      if (url.protocol !== 'https:') {
        return new Response(
          JSON.stringify({ success: false, error: 'Only HTTPS URLs are allowed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate fileName (alphanumeric, dots, dashes, underscores only)
    if (fileName && !/^[\w.-]{1,255}$/.test(fileName)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file name format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing invoice');

    // Download the file from the signed URL
    const fileResponse = await fetch(fileUrl);
    
    if (!fileResponse.ok) {
      console.error('File download failed with status:', fileResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to download file for processing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check file size (10MB limit)
    const contentLength = fileResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: 'File size exceeds 10MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const fileBuffer = await fileResponse.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    // Determine mime type from file extension
    const mimeType = fileName.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'image/jpeg';

    console.log('File size:', fileBuffer.byteLength, 'bytes');

    // Use Lovable AI with Gemini Pro for better document understanding
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `אתה מנתח חשבוניות מקצועי. נתח את החשבונית הבאה וחלץ את המידע הבא:
- service_name: שם השירות או החברה
- amount: סכום מספרי בלבד (ללא מטבע)
- currency: מטבע (ILS, USD, EUR)
- billing_date: תאריך החיוב (YYYY-MM-DD)
- billing_cycle: מחזור חיוב (monthly, yearly, quarterly, one-time)
- sender: שם שולח החשבונית

חשוב: קרא את הקובץ בקפידה וחלץ את המידע האמיתי. אם לא מצאת מידע מסוים, השתמש ב-null.
אם זה לא חשבונית אמיתית, ציין זאת.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64File}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_invoice_data',
              description: 'Extract structured data from an invoice',
              parameters: {
                type: 'object',
                properties: {
                  service_name: { type: 'string', description: 'Name of the service or company' },
                  amount: { type: 'number', description: 'Billing amount without currency' },
                  currency: { type: 'string', description: 'Currency code (ILS, USD, EUR, etc.)' },
                  billing_date: { type: 'string', description: 'Billing date in YYYY-MM-DD format' },
                  billing_cycle: { 
                    type: 'string', 
                    enum: ['monthly', 'yearly', 'quarterly', 'one-time'],
                    description: 'Billing cycle' 
                  },
                  sender: { type: 'string', description: 'Invoice sender' }
                },
                required: ['service_name'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_invoice_data' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process invoice with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');

    let parsedData = null;
    if (aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const args = aiData.choices[0].message.tool_calls[0].function.arguments;
      parsedData = typeof args === 'string' ? JSON.parse(args) : args;
    }

    console.log('Parsed invoice data:', parsedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in parse-invoice function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An error occurred while processing the invoice'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});