
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Allowed phone types and directions
const ALLOWED_TYPES = ["call", "text"];
const ALLOWED_DIRECTIONS = ["incoming", "outgoing", "missed", "unknown"];
// Allowed sync types
const ALLOWED_SYNC_TYPES = ["manual", "auto", "scheduled", "import", "daily"];

interface Communication {
  type: string;
  direction: string;
  contact_phone: string;
  contact_name?: string;
  content?: string;
  duration?: number;
  timestamp: string;
  chat_session?: string;
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
  if (!comm.contact_phone && !comm.chat_session) return false; // Allow using chat_session as alternative
  if (!comm.timestamp) return false;
  
  // Call-specific validation
  if (comm.type === "call" && comm.duration !== undefined) {
    if (typeof comm.duration !== "number" || comm.duration < 0) return false;
  }
  
  return true;
}

// Format phone number to a consistent format for matching
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  return phoneNumber.replace(/\D/g, '');
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
    console.log("Received payload with:", payload.communications?.length, "communication records");
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
  
  // Validate sync type and ensure it's included in ALLOWED_SYNC_TYPES
  let syncType = payload.sync_type || 'import';
  if (!ALLOWED_SYNC_TYPES.includes(syncType)) {
    console.log(`Invalid sync type: ${syncType}. Defaulting to 'import'`);
    syncType = 'import';
  }
  
  let syncLogId = payload.sync_id;
  
  // Create a sync log entry if one doesn't exist
  if (!syncLogId) {
    console.log("Creating new sync log with type:", syncType);
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
    
    syncLogId = syncLog.id;
    console.log("Created new sync log with ID:", syncLogId);
  } else {
    console.log("Using existing sync log with ID:", syncLogId);
  }
  
  // Process and validate communications
  const validCommunications = [];
  const invalidCommunications = [];
  const invalidRecords = [];
  let processedCount = 0;
  
  for (const comm of payload.communications) {
    // Format phone numbers to a consistent format for matching
    if (comm.contact_phone) {
      comm.contact_phone = formatPhoneNumber(comm.contact_phone);
      
      // If phone number is empty after formatting, set it to use chat_session
      if (comm.contact_phone === '' && comm.chat_session) {
        comm.contact_phone = 'unknown';
      }
    }
    
    if (validateCommunication(comm)) {
      validCommunications.push({
        ...comm,
        user_id: payload.user_id,
        import_id: syncLogId  // Add import ID to track which import this came from
      });
    } else {
      invalidCommunications.push(comm);
      invalidRecords.push({
        record: comm,
        reason: "Failed validation checks"
      });
    }
  }
  
  console.log(`Processed ${payload.communications.length} records: ${validCommunications.length} valid, ${invalidCommunications.length} invalid`);
  
  // Create a table for import errors if it doesn't exist
  try {
    // First check if table exists
    const { data: tablesCheck } = await supabase
      .rpc('check_table_exists', { table_name: 'import_errors' });
    
    if (!tablesCheck) {
      console.log("Creating import_errors table");
      await supabase.rpc('create_import_errors_table');
    }
  } catch (error) {
    console.error("Error checking or creating import_errors table:", error);
    // Continue even if table creation fails
  }
  
  // Insert invalid records into import_errors table if available
  if (invalidRecords.length > 0) {
    try {
      const { error: insertErrorsError } = await supabase
        .from('import_errors')
        .insert(invalidRecords.map(item => ({
          user_id: payload.user_id,
          import_id: syncLogId,
          record_data: item.record,
          reason: item.reason,
          created_at: new Date().toISOString()
        })));
        
      if (insertErrorsError) {
        console.error("Failed to insert into import_errors table:", insertErrorsError);
      } else {
        console.log(`Saved ${invalidRecords.length} error records to import_errors table`);
      }
    } catch (error) {
      console.error("Error inserting into import_errors table:", error);
      // Continue processing even if error logging fails
    }
  }
  
  // Insert valid communications into database with conflict handling
  let insertedCount = 0;
  let skipCount = 0;
  if (validCommunications.length > 0) {
    // Modified: Use batch inserts with better error handling
    const BATCH_SIZE = 100;
    let successfulInserts = 0;
    let failedInserts = 0;
    
    // Process in batches to prevent timeout and improve error handling
    for (let i = 0; i < validCommunications.length; i += BATCH_SIZE) {
      const batch = validCommunications.slice(i, i + BATCH_SIZE);
      
      try {
        // Don't use onConflict here - we'll handle checking for duplicates in better ways
        const { data, error, count } = await supabase
          .from('communications')
          .insert(batch.map(comm => ({
            user_id: comm.user_id,
            type: comm.type,
            direction: comm.direction,
            contact_phone: comm.contact_phone,
            contact_name: comm.contact_name,
            content: comm.content,
            duration: comm.duration,
            timestamp: comm.timestamp,
            import_id: syncLogId,
          })))
          .select();
        
        if (error) {
          // Check if the error is due to unique constraint violation
          if (error.code === '23505') {
            console.log(`Batch ${i} had duplicate entries that were skipped`);
            skipCount += batch.length; // Approximate for now
          } else {
            console.error(`Error inserting batch ${i}:`, error);
            failedInserts += batch.length;
            
            // Log the failed batch to import_errors table
            try {
              await supabase
                .from('import_errors')
                .insert(batch.map(record => ({
                  user_id: payload.user_id,
                  import_id: syncLogId,
                  record_data: record,
                  reason: `Batch insert error: ${error.message || "Unknown error"}`,
                  created_at: new Date().toISOString()
                })));
            } catch (logError) {
              console.error("Failed to log batch errors:", logError);
            }
          }
        } else {
          successfulInserts += (data?.length || batch.length);
          console.log(`Successfully inserted batch ${i} with ${data?.length || batch.length} records`);
        }
      } catch (error: any) {
        console.error(`Unexpected error during batch ${i}:`, error);
        failedInserts += batch.length;
      }
    }
    
    insertedCount = successfulInserts;
    console.log(`Import summary: ${successfulInserts} inserted, ${skipCount} skipped, ${failedInserts} failed`);
  }
  
  // Check if this is the last chunk for this sync ID
  const isLastChunk = payload.isLastChunk === true;
  
  // If this is the last chunk or not specified, mark the sync as completed
  if (isLastChunk || payload.isLastChunk === undefined) {
    // Update sync log to completed status
    const { error: updateError } = await supabase
      .from('communication_sync_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        records_synced: insertedCount
      })
      .eq('id', syncLogId);
    
    if (updateError) {
      console.error('Error updating sync log:', updateError);
    } else {
      console.log(`Marked sync log ${syncLogId} as completed with ${insertedCount} records`);
    }
    
    // Process contact mappings - create mappings for any new phone numbers
    const phoneNumbers = [...new Set(validCommunications.map(comm => comm.contact_phone).filter(p => p !== 'unknown'))];
    const chatSessions = [...new Set(validCommunications.map(comm => comm.chat_session).filter(Boolean))];
    
    // Unique contact identifiers from both phone numbers and chat sessions
    const contactIdentifiers = new Set([...phoneNumbers, ...chatSessions]);
    
    if (contactIdentifiers.size > 0) {
      // Get existing mappings
      const { data: existingMappings } = await supabase
        .from('phone_contact_mappings')
        .select('phone_number')
        .eq('user_id', payload.user_id);
      
      const existingPhoneNumbers = existingMappings 
        ? existingMappings.map(mapping => mapping.phone_number) 
        : [];
        
      // Filter out identifiers that already have mappings
      const newIdentifiers = Array.from(contactIdentifiers).filter(
        identifier => !existingPhoneNumbers.includes(identifier)
      );
      
      // Create mappings for new identifiers
      if (newIdentifiers.length > 0) {
        const newMappings = newIdentifiers.map(identifier => {
          // Find a communication with this identifier to get the contact name
          const communication = validCommunications.find(
            comm => comm.contact_phone === identifier || comm.chat_session === identifier
          );
          
          return {
            user_id: payload.user_id,
            phone_number: identifier,
            contact_name: communication?.contact_name || null
          };
        });
        
        const { error: mappingError } = await supabase
          .from('phone_contact_mappings')
          .insert(newMappings);
          
        if (mappingError) {
          console.error("Error creating phone contact mappings:", mappingError);
        } else {
          console.log(`Created ${newMappings.length} new phone contact mappings`);
        }
      }
    }
    
    // Update user's last_import_date in user_settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: payload.user_id,
        last_import_date: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
      
    if (settingsError) {
      console.error("Error updating user_settings:", settingsError);
    }
  } else {
    console.log(`This is not the last chunk for sync ${syncLogId}, keeping status as in_progress`);
  }
  
  // Calculate status code based on results
  // Use 200 if everything succeeded, 207 (Multi-Status) if some failed but others succeeded
  const statusCode = invalidRecords.length > 0 ? 207 : 200;
  
  // Return appropriate response
  return new Response(
    JSON.stringify({
      success: true,
      processed: validCommunications.length + invalidCommunications.length,
      inserted: insertedCount,
      skipped: skipCount,
      invalid: invalidCommunications.length,
      invalidRecords,
      sync_id: syncLogId,
      status: statusCode === 200 ? 'success' : 'partial_success'
    }),
    { 
      status: statusCode, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    }
  );
});
