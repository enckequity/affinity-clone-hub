
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Allowed directions and sync types
const ALLOWED_DIRECTIONS = ["incoming", "outgoing", "missed", "unknown"];
const ALLOWED_SYNC_TYPES = ["manual", "auto", "scheduled", "import"];

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validates a basic phone number format (doesn't have to be perfect E.164)
function isValidPhoneNumber(phone: string): boolean {
  return phone && phone.length >= 7 && /\d/.test(phone);
}

// Normalize phone number to E.164-like format (remove non-numeric chars except leading +)
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Keep the leading + if it exists
  const hasPlus = phone.startsWith('+');
  
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  
  // Add back the + if it was there
  return hasPlus ? `+${digits}` : digits;
}

// Extract phone number from chat session string if present
function extractPhoneNumber(chatSession: string): string | null {
  if (!chatSession) return null;
  
  // Look for patterns that might be phone numbers in the chat session
  const phonePattern = /(?:\+|(?:\+\d{1,3}))?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const matches = chatSession.match(phonePattern);
  
  if (matches && matches.length > 0) {
    return normalizePhoneNumber(matches[0]);
  }
  
  return null;
}

// Normalize direction value to lowercase and ensure it's valid
function normalizeDirection(direction: string): string {
  if (!direction) return 'unknown';
  
  // Convert to lowercase
  const lowercaseDirection = direction.toLowerCase();
  
  // Check if it matches one of our allowed directions
  if (ALLOWED_DIRECTIONS.includes(lowercaseDirection)) {
    return lowercaseDirection;
  }
  
  // Handle common variations
  if (lowercaseDirection.includes('in') || lowercaseDirection.includes('received')) {
    return 'incoming';
  } else if (lowercaseDirection.includes('out') || lowercaseDirection.includes('sent')) {
    return 'outgoing';
  } else if (lowercaseDirection.includes('miss')) {
    return 'missed';
  }
  
  // Default fallback
  return 'unknown';
}

interface CommunicationRecord {
  // Required fields
  type: 'call' | 'text';
  direction: 'incoming' | 'outgoing' | 'missed' | 'unknown';
  contact_phone: string;
  timestamp: string;
  
  // Optional fields
  contact_name?: string;
  content?: string;
  duration?: number;
  chat_session?: string;
  sender_name?: string;
}

interface ImportResponse {
  status: string;
  sync_id: string;
  processed: number;
  inserted: number;
  skipped: number;
  invalid: number;
  incoming: number;
  outgoing: number;
  unmatchedPhones: string[];
  invalidRecords?: Array<{ record: any; reason: string }>;
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
    // Parse request body
    const payload = await req.json();
    
    // Basic validation
    if (!payload || !Array.isArray(payload.communications) || !payload.user_id) {
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
    
    // Get current user information for outgoing messages
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', payload.user_id)
      .single();
    
    if (userProfileError) {
      console.error("Error fetching user profile:", userProfileError);
    }
    
    const userFullName = userProfile 
      ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
      : 'Me';
    
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
    const validRecords: CommunicationRecord[] = [];
    const invalidRecords: Array<{ record: any; reason: string }> = [];
    const uniqueContactPhones = new Set<string>();
    let incomingCount = 0;
    let outgoingCount = 0;
    
    for (const comm of payload.communications) {
      try {
        // Skip empty rows
        if (!comm || Object.keys(comm).length === 0) {
          continue;
        }
        
        // For iMazing format, do special processing
        if (payload.fileFormat === 'imazing') {
          const record: CommunicationRecord = {
            type: 'text', // iMazing exports are text messages
            direction: 'unknown',
            contact_phone: 'unknown',
            timestamp: new Date().toISOString(), // Default value, will be overwritten
          };
          
          // Extract and normalize values
          const chatSession = comm['chat session'] || comm['Chat Session'] || '';
          record.chat_session = chatSession;
          
          // Message Date - convert to ISO
          const messageDate = comm['message date'] || comm['Message Date'] || '';
          if (messageDate) {
            try {
              const date = new Date(messageDate);
              if (!isNaN(date.getTime())) {
                record.timestamp = date.toISOString();
              } else {
                throw new Error('Invalid date format');
              }
            } catch (e) {
              throw new Error(`Invalid timestamp: ${messageDate}`);
            }
          } else {
            throw new Error('Missing timestamp');
          }
          
          // Message Type - determine direction
          const messageType = comm['type'] || comm['Type'] || '';
          // Normalize the direction using our new function
          record.direction = normalizeDirection(messageType);
          
          // Track direction counts
          if (record.direction === 'incoming') incomingCount++;
          if (record.direction === 'outgoing') outgoingCount++;
          
          // Sender Name - use from CSV for incoming, user profile for outgoing
          const senderName = comm['sender name'] || comm['Sender Name'] || '';
          record.sender_name = senderName;
          
          // If outgoing, use current user's name
          if (record.direction === 'outgoing') {
            record.contact_name = userFullName;
          } else {
            record.contact_name = senderName || null;
          }
          
          // Message Text
          record.content = comm['text'] || comm['Text'] || '';
          
          // Extract phone number from chat session
          let phone = extractPhoneNumber(chatSession);
          
          // If we couldn't extract a phone from chat session, look for a sender ID
          if (!phone) {
            const senderId = comm['sender id'] || comm['Sender ID'] || comm['senderid'] || '';
            if (isValidPhoneNumber(senderId)) {
              phone = normalizePhoneNumber(senderId);
            }
          }
          
          // If we found a valid phone number, use it
          if (phone) {
            record.contact_phone = phone;
            uniqueContactPhones.add(phone);
          } else {
            // Use chat session as fallback identifier
            record.contact_phone = `chat:${chatSession.substring(0, 50)}`;
          }
          
          validRecords.push(record);
        } else {
          // For standard format, validate required fields
          if (!comm.contact_phone) throw new Error('Missing contact phone');
          if (!comm.type) throw new Error('Missing type');
          
          // Normalize direction using our new function
          const normalizedDirection = normalizeDirection(comm.direction);
          
          if (!normalizedDirection) {
            throw new Error(`Invalid direction: ${comm.direction}`);
          }
          
          if (!comm.timestamp) throw new Error('Missing timestamp');
          
          // Count directions
          if (normalizedDirection === 'incoming') incomingCount++;
          if (normalizedDirection === 'outgoing') outgoingCount++;
          
          // Add to valid records with normalized direction
          validRecords.push({
            ...comm,
            direction: normalizedDirection,
            user_id: payload.user_id
          });
          
          // Track unique contact phones
          if (isValidPhoneNumber(comm.contact_phone)) {
            uniqueContactPhones.add(normalizePhoneNumber(comm.contact_phone));
          }
        }
      } catch (err: any) {
        invalidRecords.push({
          record: comm,
          reason: err.message || 'Validation failed'
        });
      }
    }
    
    // Get existing contacts to determine unmatched phones
    const uniquePhonesArray = Array.from(uniqueContactPhones);
    const unmatchedPhones: string[] = [];
    
    if (uniquePhonesArray.length > 0) {
      const { data: existingMappings } = await supabase
        .from('phone_contact_mappings')
        .select('phone_number, contact_id')
        .in('phone_number', uniquePhonesArray)
        .eq('user_id', payload.user_id);
      
      const mappedPhones = new Set(existingMappings?.map(m => m.phone_number) || []);
      unmatchedPhones.push(...uniquePhonesArray.filter(phone => !mappedPhones.has(phone)));
    }
    
    // Insert valid communications into database
    let insertedCount = 0;
    let skippedCount = 0;
    
    if (validRecords.length > 0) {
      // Prepare records for insert with user_id
      const recordsToInsert = validRecords.map(record => ({
        user_id: payload.user_id,
        type: record.type,
        direction: record.direction,
        contact_phone: record.contact_phone,
        contact_name: record.contact_name,
        content: record.content,
        duration: record.duration,
        timestamp: record.timestamp,
        chat_session: record.chat_session,
        sender_name: record.sender_name
      }));
      
      // Modified: Don't use upsert with onConflict since we don't have a unique constraint
      // Instead, check for existing records before inserting
      
      const newRecordsToInsert = [];
      for (const record of recordsToInsert) {
        // Check if this record already exists
        const { data: existingRecords, error: checkError } = await supabase
          .from('communications')
          .select('id')
          .eq('user_id', record.user_id)
          .eq('contact_phone', record.contact_phone)
          .eq('timestamp', record.timestamp)
          .eq('type', record.type)
          .eq('direction', record.direction);
          
        if (checkError) {
          console.error('Error checking for existing record:', checkError);
          continue;
        }
        
        if (existingRecords && existingRecords.length > 0) {
          // Skip this record as it already exists
          skippedCount++;
        } else {
          // This is a new record, add it to the insert batch
          newRecordsToInsert.push(record);
        }
      }
      
      // Insert only new records
      if (newRecordsToInsert.length > 0) {
        const { data, error, count } = await supabase
          .from('communications')
          .insert(newRecordsToInsert)
          .select();
        
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
        
        insertedCount = count || 0;
      }
    }
    
    // Process contact mappings - create mappings for any new phone numbers
    const phoneNumbers = Array.from(uniqueContactPhones);
    
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
          const communication = validRecords.find(
            comm => comm.contact_phone === phoneNumber && comm.direction === 'incoming'
          );
          
          return {
            user_id: payload.user_id,
            phone_number: phoneNumber,
            contact_name: communication?.contact_name || communication?.sender_name || null
          };
        });
        
        await supabase
          .from('phone_contact_mappings')
          .insert(newMappings);
      }
    }
    
    // Log any invalid records to import_errors table
    if (invalidRecords.length > 0) {
      try {
        await supabase
          .from('import_errors')
          .insert({
            user_id: payload.user_id,
            sync_id: syncLogId,
            errors: invalidRecords,
            timestamp: new Date().toISOString()
          });
      } catch (errLoggingError) {
        console.error('Error logging invalid records:', errLoggingError);
      }
    }
    
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
    }
    
    // Prepare response
    const response: ImportResponse = {
      status: invalidRecords.length > 0 ? 'partial_success' : 'success',
      sync_id: syncLogId,
      processed: validRecords.length + invalidRecords.length,
      inserted: insertedCount,
      skipped: skippedCount,
      invalid: invalidRecords.length,
      incoming: incomingCount,
      outgoing: outgoingCount,
      unmatchedPhones,
    };
    
    // Include first 10 invalid records in the response for debugging
    if (invalidRecords.length > 0) {
      response.invalidRecords = invalidRecords.slice(0, 10);
    }
    
    // Return success response
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (err: any) {
    console.error('Unhandled error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
