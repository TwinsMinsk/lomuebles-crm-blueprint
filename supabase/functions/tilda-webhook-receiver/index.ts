
// Follow Deno edge function standard imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Set up CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API key for webhook authentication
const API_KEY = 'tilda_webhook_74b91d28e5f94a3c8b7e6d2c9a1f5e3d'

// Admin user ID to use as creator_user_id
const ADMIN_USER_ID = '99b2a5aa-5efa-4912-8e3b-623bb5f33cdd'

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
    console.log('Received webhook data:', JSON.stringify(requestData))

    // Validate required fields
    if (!requestData.formType || requestData.formType !== 'callback' || !requestData.name || !requestData.phone) {
      console.log('Bad request: Invalid or missing required fields')
      return new Response(JSON.stringify({ status: 'error', message: 'Invalid data format' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      })
    }
    
    // Extract data, now including initial_comment
    const { name, phone, source, language = 'RU', initial_comment } = requestData
    
    // Create lead in Supabase
    const leadData = {
      name,
      phone,
      lead_source: source || `Обратный звонок: ${requestData.formIdTilda || 'неизвестная форма'}`,
      client_language: language,
      lead_status: 'Новый',
      creator_user_id: ADMIN_USER_ID,
      // Add initial_comment field to the data being inserted
      initial_comment: initial_comment,
      // assigned_user_id remains null by default
    }

    console.log('Creating lead with data:', JSON.stringify(leadData))
    
    const { data: newLead, error } = await supabaseClient
      .from('leads')
      .insert(leadData)
      .select('lead_id')
      .single()
      
    if (error) {
      console.error('Error creating lead:', error.message)
      return new Response(JSON.stringify({ status: 'error', message: 'Failed to create lead' }), { 
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
    console.error('Server error:', error.message)
    return new Response(JSON.stringify({ status: 'error', message: 'Internal server error' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    })
  }
})
