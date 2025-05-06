
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Check if method is POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  try {
    // Parse request body
    const { auth_token, app_id } = await req.json();
    
    if (!auth_token || !app_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Create a Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(auth_token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Record the desktop app registration
    const { data: appData, error: registerError } = await supabase
      .from('desktop_app_instances')
      .upsert({
        app_id,
        user_id: user.id,
        last_active: new Date().toISOString(),
        status: 'active'
      }, {
        onConflict: 'app_id',
        returning: 'minimal'
      });
      
    if (registerError) {
      console.error('Error registering desktop app:', registerError);
      return new Response(JSON.stringify({ error: 'Failed to register desktop app' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Generate a long-lived API key for the desktop app
    // In a production app, you'd implement a proper token system with refresh capability
    // This is simplified for this example
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('desktop_app_keys')
      .upsert({
        app_id,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        created_at: new Date().toISOString()
      }, {
        onConflict: 'app_id,user_id',
        returning: 'representation'
      });
      
    if (apiKeyError) {
      console.error('Error generating API key:', apiKeyError);
      return new Response(JSON.stringify({ error: 'Failed to generate API key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Return success response with API key
    return new Response(JSON.stringify({
      success: true,
      user_id: user.id,
      app_id,
      api_key: apiKeyData.key, 
      expires_at: apiKeyData.expires_at
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Unexpected error in desktop-auth function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
