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
    const { fileUrl, fileName } = await req.json();
    
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Parsing invoice:', fileName);

    // Download the file
    const fileResponse = await fetch(fileUrl);
    const fileBuffer = await fileResponse.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    // Use Lovable AI to parse the invoice
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `אתה מנתח חשבוניות מקצועי. תפקידך לחלץ מידע מחשבוניות בעברית ולהחזיר JSON מובנה.
עליך לחלץ:
- service_name: שם השירות או החברה (טקסט)
- amount: סכום (מספר בלבד, ללא מטבע)
- currency: מטבע (ILS, USD, EUR וכו')
- billing_date: תאריך החיוב בפורמט YYYY-MM-DD
- billing_cycle: מחזור חיוב (monthly, yearly, quarterly)
- sender: שולח החשבונית

אם לא מצאת מידע, השתמש ב-null.
החזר רק JSON תקין, ללא טקסט נוסף.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `נתח את החשבונית הבאה וחלץ את המידע הנדרש:`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64File}`
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
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData));

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
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});