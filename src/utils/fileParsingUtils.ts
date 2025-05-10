
import { CommunicationRecord } from "@/types/fileImport";

export type FileFormat = 'standard' | 'imazing' | 'unknown';

// Function to detect file format based on headers
export const detectFileFormat = (headers: string[]): FileFormat => {
  // Check for UTF-8 BOM and strip if present
  headers = headers.map(h => h.replace(/^\uFEFF/, ''));
  
  // Normalize headers for case-insensitive comparison
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Detect iMessage format (improved to match the user's sample)
  const isIMessageFormat = (
    (normalizedHeaders.includes('chat session')) ||
    (normalizedHeaders.includes('sender id') || normalizedHeaders.includes('senderid')) && 
    (normalizedHeaders.includes('message date') || normalizedHeaders.includes('date')) &&
    (normalizedHeaders.includes('text') || normalizedHeaders.includes('message')) &&
    (normalizedHeaders.includes('type') || normalizedHeaders.includes('service'))
  );
  
  // Detect standard format
  const isStandardFormat = normalizedHeaders.includes('phone') && 
                          (normalizedHeaders.includes('timestamp') || normalizedHeaders.includes('date')) &&
                          (normalizedHeaders.includes('text') || normalizedHeaders.includes('message') || normalizedHeaders.includes('content'));
  
  if (isIMessageFormat) {
    return 'imazing';
  }
  
  if (isStandardFormat) {
    return 'standard';
  }
  
  return 'unknown';
};

// Function to parse CSV format
export const parseCSV = (csvContent: string): any[] => {
  // Strip UTF-8 BOM if present
  csvContent = csvContent.replace(/^\uFEFF/, '');
  
  const lines = csvContent.split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return null; // Skip empty lines
    
    // Handle quoted values properly (improved implementation)
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue);
    
    // Create object from headers and values
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      if (i < values.length) {
        // Remove quotes from the beginning and end if they exist
        let value = values[i];
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        obj[header] = value.trim();
      } else {
        obj[header] = '';
      }
    });
    
    return obj;
  }).filter(Boolean);
};

// Convert CSV record to our standardized communication format
export const standardizeCommunication = (record: Record<string, string>, fileFormat: FileFormat, forceImport: boolean = false): CommunicationRecord => {
  if (fileFormat === 'imazing' || forceImport) {
    // Mapping fields for iMessage format with fallbacks
    const chatSessionField = Object.keys(record).find(k => 
      ['chat session'].includes(k.toLowerCase())
    ) || '';
    
    const senderIdField = Object.keys(record).find(k => 
      ['sender id', 'senderid', 'sender', 'from'].includes(k.toLowerCase())
    ) || '';
    
    const typeField = Object.keys(record).find(k => 
      ['type', 'message type', 'messagetype'].includes(k.toLowerCase())
    ) || '';
    
    const senderNameField = Object.keys(record).find(k => 
      ['sender name', 'sendername', 'from name'].includes(k.toLowerCase())
    ) || '';
    
    const messageDateField = Object.keys(record).find(k => 
      ['message date', 'messagedate', 'date', 'time'].includes(k.toLowerCase())
    ) || '';
    
    const textField = Object.keys(record).find(k => 
      ['text', 'message', 'content', 'body'].includes(k.toLowerCase())
    ) || '';
    
    const serviceField = Object.keys(record).find(k => 
      ['service', 'platform'].includes(k.toLowerCase())
    ) || '';
    
    // Determine direction based on type field directly
    let direction = 'unknown';
    
    if (typeField && record[typeField]) {
      const typeValue = record[typeField].toLowerCase();
      if (typeValue.includes('incoming')) {
        direction = 'incoming';
      } else if (typeValue.includes('outgoing')) {
        direction = 'outgoing';
      } else if (typeValue.includes('missed')) {
        direction = 'missed';
      }
    }
    
    // If direction is still unknown, try using service field
    if (direction === 'unknown' && serviceField && record[serviceField]) {
      // For iMessage format, try to determine from "Type" field
      const serviceValue = record[serviceField].toLowerCase();
      if (senderIdField && record[senderIdField]) {
        direction = 'incoming';  // If sender ID is present, it's usually incoming
      } else {
        direction = 'outgoing';  // Otherwise, it's likely outgoing
      }
    }
    
    // Get contact info
    let phoneNumber = '';
    let contactName = '';
    
    // Use sender ID for phone number if present
    if (senderIdField && record[senderIdField]) {
      phoneNumber = record[senderIdField];
      
      // Clean up phone number (remove non-numeric characters if it looks like a phone number)
      if (phoneNumber.includes('+') || /\d{10,}/.test(phoneNumber)) {
        phoneNumber = phoneNumber.replace(/\D/g, '');
        if (phoneNumber.length > 0) {
          // Add + back if it was there
          if (record[senderIdField].startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
          }
        }
      }
    }
    
    // Use chat session as a fallback for contact information
    if ((!phoneNumber || phoneNumber === 'unknown') && chatSessionField && record[chatSessionField]) {
      contactName = record[chatSessionField];
      // If chat session has a phone-like format, use it as phone number
      if (/\+?\d{10,}/.test(record[chatSessionField])) {
        phoneNumber = record[chatSessionField];
      }
    }
    
    // Use sender name if available
    if (senderNameField && record[senderNameField]) {
      contactName = record[senderNameField];
    }
    
    // Try to parse iMessage date format
    let timestamp = record[messageDateField] || new Date().toISOString();
    if (timestamp && !timestamp.includes('T')) {
      // iMessage export typically has a format like "2023-10-15 14:30:25"
      try {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          timestamp = date.toISOString();
        }
      } catch (e) {
        console.warn("Could not parse timestamp:", timestamp);
        timestamp = new Date().toISOString();
      }
    }
    
    // Get message content, truncate if necessary (>65KB)
    const content = (record[textField] || '').substring(0, 65000);
    
    return {
      contact_phone: phoneNumber || 'unknown',
      contact_name: contactName || '',
      direction: direction,
      type: 'text', // Assuming all are text messages
      content: content,
      timestamp: timestamp,
      chat_session: record[chatSessionField] || '' // Add chat_session for unique constraining
    };
  } else {
    // Standard format mapping
    const phoneField = Object.keys(record).find(k => 
      ['phone', 'phone_number', 'contact', 'contact_phone', 'number'].includes(k.toLowerCase())
    ) || '';
    
    const timestampField = Object.keys(record).find(k => 
      ['timestamp', 'date', 'time', 'datetime'].includes(k.toLowerCase())
    ) || '';
    
    const contentField = Object.keys(record).find(k => 
      ['content', 'text', 'message', 'body', 'msg'].includes(k.toLowerCase())
    ) || '';
    
    const directionField = Object.keys(record).find(k => 
      ['direction', 'type', 'messagetype', 'message_type'].includes(k.toLowerCase())
    ) || '';
    
    const nameField = Object.keys(record).find(k => 
      ['name', 'contact_name', 'sender', 'recipient'].includes(k.toLowerCase())
    ) || '';
    
    // Determine direction based on available fields
    let direction = 'unknown';
    if (directionField && record[directionField]) {
      const dirValue = record[directionField].toLowerCase();
      if (dirValue.includes('in') || dirValue.includes('received')) {
        direction = 'incoming';
      } else if (dirValue.includes('out') || dirValue.includes('sent')) {
        direction = 'outgoing';
      }
    }
    
    // Try to parse timestamp
    let timestamp = record[timestampField] || new Date().toISOString();
    if (timestamp && !timestamp.includes('T')) {
      // Try to parse various date formats
      try {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          timestamp = date.toISOString();
        }
      } catch (e) {
        console.warn("Could not parse timestamp:", timestamp);
        timestamp = new Date().toISOString();
      }
    }

    // Get message content, truncate if necessary (>65KB)
    const content = (record[contentField] || '').substring(0, 65000);

    return {
      contact_phone: record[phoneField] || 'unknown',
      contact_name: record[nameField] || '',
      direction: direction,
      type: 'text', // Assuming all are text messages
      content: content,
      timestamp: timestamp,
      chat_session: '' // Empty for standard format
    };
  }
};

// Parse file content based on format
export const parseFileContent = async (file: File, forceImport: boolean = false): Promise<{
  data: CommunicationRecord[];
  fileFormat: FileFormat;
  skippedRecords: Array<{record: any, reason: string}>;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        const csv = event.target.result as string;
        const lines = csv.split('\n');
        
        if (lines.length === 0) {
          reject(new Error("CSV file appears to be empty"));
          return;
        }
        
        // Get headers to detect format
        const headers = lines[0].split(',').map(h => h.trim());
        let fileFormat = detectFileFormat(headers);
        
        // If force import is enabled and format is unknown, treat as iMessage
        if (forceImport && fileFormat === 'unknown') {
          fileFormat = 'imazing';
        }
        
        console.log("CSV Headers:", headers);
        console.log("File format detected:", fileFormat);
        
        // Parse CSV
        const parsedRecords = parseCSV(csv);
        
        if (parsedRecords.length === 0) {
          reject(new Error("No records found in the CSV file"));
          return;
        }
        
        console.log("Sample record:", parsedRecords[0]);
        
        // Convert to standardized format
        const skippedRecords: Array<{record: any, reason: string}> = [];
        const standardizedData: CommunicationRecord[] = [];
        
        parsedRecords.forEach(record => {
          try {
            const standardized = standardizeCommunication(record, fileFormat, forceImport);
            standardizedData.push(standardized);
          } catch (err: any) {
            skippedRecords.push({
              record,
              reason: err.message || "Failed to parse record"
            });
          }
        });
        
        console.log("Sample standardized record:", standardizedData[0]);
        
        // Filter out records with missing required fields
        const validData = standardizedData.filter(record => {
          if (record.timestamp === 'unknown') {
            skippedRecords.push({
              record,
              reason: "Invalid timestamp"
            });
            return false;
          }
          
          if (record.contact_phone === 'unknown' && !record.chat_session) {
            skippedRecords.push({
              record,
              reason: "Missing contact information"
            });
            return false;
          }
          
          return true;
        });
        
        if (!validData || validData.length === 0) {
          reject(new Error("No valid data found in the file. Please ensure your CSV contains the required columns for your format type."));
          return;
        }
        
        // Log some stats for debugging
        console.log(`Found ${parsedRecords.length} records, ${validData.length} valid after conversion, ${skippedRecords.length} skipped`);
        
        resolve({ 
          data: validData, 
          fileFormat,
          skippedRecords
        });
      } catch (err: any) {
        console.error("Error parsing file:", err);
        reject(err);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    
    reader.readAsText(file);
  });
};
