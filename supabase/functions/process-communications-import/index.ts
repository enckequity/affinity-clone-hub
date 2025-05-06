
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommunicationRecord {
  contact_phone: string;
  contact_name?: string;
  direction: string;
  type: string;
  content?: string;
  duration?: number;
  timestamp: string;
}

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
    // Get the request body
    const requestData = await req.json();
    const { communications, sync_type } = requestData;
    
    // Validate the token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the URL and service key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Validate the communications data
    if (!Array.isArray(communications) || communications.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid communications data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Create sync log
    const { data: syncLog, error: syncLogError } = await supabase
      .from('communication_sync_logs')
      .insert({
        user_id: user.id,
        sync_type: sync_type || 'manual',
        status: 'in_progress',
        start_time: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (syncLogError) {
      console.error('Error creating sync log:', syncLogError);
      return new Response(JSON.stringify({ error: 'Failed to create sync log' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Process and validate each communication record
    const validCommunications = [];
    const invalidRecords = [];
    
    for (const record of communications) {
      // Basic validation
      if (!record.contact_phone || !record.direction || !record.type || !record.timestamp) {
        invalidRecords.push({ record, reason: 'Missing required fields' });
        continue;
      }
      
      // Format validation
      const timestamp = new Date(record.timestamp);
      if (isNaN(timestamp.getTime())) {
        invalidRecords.push({ record, reason: 'Invalid timestamp format' });
        continue;
      }
      
      // Convert the record to a valid format for the database
      const validRecord = {
        user_id: user.id,
        contact_phone: record.contact_phone,
        contact_name: record.contact_name || null,
        direction: record.direction,
        type: record.type,
        content: record.content || null,
        duration: record.duration || null,
        timestamp: timestamp.toISOString(),
        read: false,
        important: false
      };
      
      validCommunications.push(validRecord);
    }
    
    // Insert valid communications into the database
    let insertedCount = 0;
    if (validCommunications.length > 0) {
      const { data, error: insertError } = await supabase
        .from('communications')
        .insert(validCommunications);
        
      if (insertError) {
        console.error('Error inserting communications:', insertError);
        
        // Update sync log with failure
        await supabase
          .from('communication_sync_logs')
          .update({
            status: 'failed',
            end_time: new Date().toISOString(),
            error_message: `Failed to insert communications: ${insertError.message}`,
            records_synced: 0
          })
          .eq('id', syncLog.id);
          
        return new Response(JSON.stringify({ error: 'Failed to insert communications', details: insertError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      insertedCount = validCommunications.length;
    }
    
    // Update the sync log with success
    await supabase
      .from('communication_sync_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        records_synced: insertedCount
      })
      .eq('id', syncLog.id);
      
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      processed: communications.length,
      inserted: insertedCount,
      invalid: invalidRecords.length,
      invalidRecords: invalidRecords,
      sync_id: syncLog.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Unexpected error in process-communications-import function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
