
// Follow Deno edge function standard imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Set up CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API key and admin user for webhook authentication (set via Supabase secrets)
const API_KEY = Deno.env.get('TILDA_WEBHOOK_API_KEY') || '';
const ADMIN_USER_ID = Deno.env.get('WEBHOOK_ADMIN_USER_ID') || '';


// Create Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ status: 'error', message: 'Method not allowed' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 405 
    })
  }

  // Verify API key from Authorization header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.replace('Bearer ', '') !== API_KEY) {
    console.log('Unauthorized request: Invalid API key')
    return new Response(JSON.stringify({ status: 'error', message: 'Unauthorized' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 401 
    })
  }

  try {
    // Get request body
    const requestData = await req.json()
    // Minimal structured logging without PII
    const safePreview = (val: string | null | undefined) => (val ? `${val.substring(0,3)}***` : 'null')
    console.log('Webhook received', {
      method: req.method,
      formType: requestData?.formType,
      formIdTilda: requestData?.formIdTilda,
      phone_masked: safePreview(requestData?.phone)
    })

    // Extract and validate required fields
    const { formType, name, phone, source, language = 'RU', initial_comment, formIdTilda } = requestData

    // 1. General validation for required fields
    if (!formType || !name || !phone) {
      console.error('Bad request: Missing required fields');
      return new Response(JSON.stringify({ status: 'error', message: 'Invalid data: Missing formType, name, or phone' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // 2. Validate formType is one of the expected types
    if (formType !== 'callback' && formType !== 'product_order_lead_simple') {
      console.error('Bad request: Unknown formType:', formType)
      return new Response(JSON.stringify({ status: 'error', message: `Invalid data: Unknown formType: ${formType}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }
    
    // Create lead data with improved field handling
    const leadData = {
      name,
      phone,
      lead_source: source || `Данные с Tilda: ${formIdTilda || 'неизвестная форма'}`,
      client_language: language,
      lead_status: 'Новый',
      creator_user_id: ADMIN_USER_ID,
      initial_comment: initial_comment || null,
      // assigned_user_id remains null by default
    }

    console.log('Creating lead (sanitized log):', { hasInitialComment: Boolean(initial_comment), source: leadData.lead_source });
    
    const { data: newLead, error } = await supabaseClient
      .from('leads')
      .insert(leadData)
      .select('lead_id')
      .single()
      
    if (error) {
      console.error('Error creating lead in Supabase:', error.message, JSON.stringify(error, null, 2))
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Failed to create lead', 
        details: error.message 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      })
    }
    
    console.log('Lead created successfully:', JSON.stringify(newLead))
    return new Response(JSON.stringify({ status: 'success', leadId: newLead.lead_id }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 201 
    })
  } catch (error) {
    console.error('Overall server error in Edge Function:', error.message, JSON.stringify(error, null, 2))
    
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return new Response(JSON.stringify({ status: 'error', message: 'Invalid JSON format in request body' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      })
    }
    
    return new Response(JSON.stringify({ status: 'error', message: 'Internal server error' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    })
  }
})
