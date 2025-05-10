
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

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
  
  // Parse request body
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  // Create a Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Fetch all users with scheduled import enabled
  const { data: userSettings, error: settingsError } = await supabase
    .from('user_settings')
    .select('user_id, scheduled_import_settings')
    .filter('scheduled_import_settings->enabled', 'eq', true);
  
  if (settingsError) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user settings', details: settingsError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  const results = [];
  
  // For each user with scheduled imports enabled
  for (const setting of userSettings || []) {
    const userId = setting.user_id;
    const importSettings = setting.scheduled_import_settings;
    
    // Create a sync log entry for this scheduled import
    const { data: syncLog, error: syncLogError } = await supabase
      .from('communication_sync_logs')
      .insert({
        user_id: userId,
        sync_type: 'scheduled',
        status: 'in_progress'
      })
      .select()
      .single();
    
    if (syncLogError) {
      results.push({
        userId,
        status: 'error',
        error: syncLogError.message
      });
      continue;
    }
    
    // In a real implementation, this would:
    // 1. Scan the watch folder specified in importSettings.watchFolder
    // 2. Process each file according to importSettings.fileFormat
    // 3. Import the data using the process-communications-import function
    // 4. Move processed files to a completed folder or error folder
    
    // For now, we'll simulate a successful import
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the sync log to completed
    await supabase
      .from('communication_sync_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        records_synced: Math.floor(Math.random() * 20) + 1 // Simulate random number of records
      })
      .eq('id', syncLog.id);
    
    results.push({
      userId,
      status: 'completed',
      syncLogId: syncLog.id
    });
  }
  
  return new Response(
    JSON.stringify({
      success: true,
      processed: results.length,
      results
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    }
  );
});
