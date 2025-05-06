
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Allowed phone types and directions
const ALLOWED_TYPES = ["call", "text"];
const ALLOWED_DIRECTIONS = ["incoming", "outgoing", "missed"];
// Allowed sync types
const ALLOWED_SYNC_TYPES = ["manual", "auto", "scheduled", "import"];

interface Communication {
  type: string;
  direction: string;
  contact_phone: string;
  contact_name?: string;
  content?: string;
  duration?: number;
  timestamp: string;
}

// Basic validation function for payload
function validatePayload(payload: any): boolean {
  if (!payload) return false;
  if (!payload.communications || !Array.isArray(payload.communications)) return false;
  if (!payload.user_id) return false;
  
  return true;
}

// Validate individual communication object
function validateCommunication(comm: any): boolean {
  if (!comm.type || !ALLOWED_TYPES.includes(comm.type)) return false;
  if (!comm.direction || !ALLOWED_DIRECTIONS.includes(comm.direction)) return false;
  if (!comm.contact_phone) return false;
  if (!comm.timestamp) return false;
  
  // Call-specific validation
  if (comm.type === "call" && comm.duration !== undefined) {
    if (typeof comm.duration !== "number" || comm.duration < 0) return false;
  }
  
  return true;
}

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
  
  // Validate payload
  if (!validatePayload(payload)) {
    return new Response(
      JSON.stringify({ error: 'Invalid payload format' }),
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
  
  // Validate sync type
  const syncType = payload.sync_type || 'manual';
  if (!ALLOWED_SYNC_TYPES.includes(syncType)) {
    return new Response(
      JSON.stringify({ error: `Invalid sync type: ${syncType}. Allowed types: ${ALLOWED_SYNC_TYPES.join(', ')}` }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  // Create a sync log entry
  const { data: syncLog, error: syncLogError } = await supabase
    .from('communication_sync_logs')
    .insert({
      user_id: payload.user_id,
      sync_type: syncType,
      status: 'in_progress'
    })
    .select()
    .single();
  
  if (syncLogError) {
    console.error('Error creating sync log:', syncLogError);
    return new Response(
      JSON.stringify({ error: 'Failed to create sync log', details: syncLogError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  const syncLogId = syncLog.id;
  
  // Process and validate communications
  const validCommunications = [];
  const invalidCommunications = [];
  const invalidRecords = [];
  let processedCount = 0;
  
  for (const comm of payload.communications) {
    if (validateCommunication(comm)) {
      validCommunications.push({
        ...comm,
        user_id: payload.user_id
      });
    } else {
      invalidCommunications.push(comm);
      invalidRecords.push({
        record: comm,
        reason: "Failed validation checks"
      });
    }
  }
  
  // Insert valid communications into database
  let insertedCount = 0;
  if (validCommunications.length > 0) {
    const { data, error } = await supabase
      .from('communications')
      .upsert(
        validCommunications.map((comm) => ({
          user_id: payload.user_id,
          type: comm.type,
          direction: comm.direction,
          contact_phone: comm.contact_phone,
          contact_name: comm.contact_name,
          content: comm.content,
          duration: comm.duration,
          timestamp: comm.timestamp,
        })),
        { onConflict: 'user_id, contact_phone, timestamp, type' }
      );
      
    if (error) {
      console.error('Error inserting communications:', error);
      
      // Update sync log to failed status
      await supabase
        .from('communication_sync_logs')
        .update({
          status: 'failed',
          end_time: new Date().toISOString(),
          error_message: `Error inserting communications: ${error.message}`
        })
        .eq('id', syncLogId);
        
      return new Response(
        JSON.stringify({ error: 'Failed to insert communications', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    processedCount = validCommunications.length;
    insertedCount = processedCount - (invalidCommunications.length || 0);
  }
  
  // Update sync log to completed status
  const { error: updateError } = await supabase
    .from('communication_sync_logs')
    .update({
      status: 'completed',
      end_time: new Date().toISOString(),
      records_synced: processedCount
    })
    .eq('id', syncLogId);
  
  if (updateError) {
    console.error('Error updating sync log:', updateError);
  }
  
  // Process contact mappings - create mappings for any new phone numbers
  const phoneNumbers = [...new Set(validCommunications.map(comm => comm.contact_phone))];
  
  if (phoneNumbers.length > 0) {
    // Get existing mappings
    const { data: existingMappings } = await supabase
      .from('phone_contact_mappings')
      .select('phone_number')
      .eq('user_id', payload.user_id);
    
    const existingPhoneNumbers = existingMappings 
      ? existingMappings.map(mapping => mapping.phone_number) 
      : [];
      
    // Filter out phone numbers that already have mappings
    const newPhoneNumbers = phoneNumbers.filter(
      number => !existingPhoneNumbers.includes(number)
    );
    
    // Create mappings for new phone numbers
    if (newPhoneNumbers.length > 0) {
      const newMappings = newPhoneNumbers.map(phoneNumber => {
        // Find a communication with this phone number to get the contact name
        const communication = validCommunications.find(
          comm => comm.contact_phone === phoneNumber
        );
        
        return {
          user_id: payload.user_id,
          phone_number: phoneNumber,
          contact_name: communication?.contact_name || null
        };
      });
      
      await supabase
        .from('phone_contact_mappings')
        .insert(newMappings);
    }
  }
  
  // Return success response
  return new Response(
    JSON.stringify({
      success: true,
      processed: processedCount,
      inserted: insertedCount,
      invalid: invalidCommunications.length,
      invalidRecords,
      sync_id: syncLogId
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    }
  );
});
