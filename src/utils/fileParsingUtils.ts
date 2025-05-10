import { CommunicationRecord } from "@/types/fileImport";

export type FileFormat = 'standard' | 'imazing' | 'unknown';

// Function to detect file format based on headers
export const detectFileFormat = (headers: string[]): FileFormat => {
  // Normalize headers for case-insensitive comparison
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Detect standard format
  const isStandardFormat = normalizedHeaders.includes('phone') && 
                          (normalizedHeaders.includes('timestamp') || normalizedHeaders.includes('date')) &&
                          (normalizedHeaders.includes('text') || normalizedHeaders.includes('message') || normalizedHeaders.includes('content'));
  
  // Detect iMessage format (improved to match the user's sample)
  const isIMessageFormat = (
    (normalizedHeaders.includes('sender id') || normalizedHeaders.includes('senderid')) && 
    (normalizedHeaders.includes('message date') || normalizedHeaders.includes('date')) &&
    (normalizedHeaders.includes('text') || normalizedHeaders.includes('message')) &&
    (normalizedHeaders.includes('type') || normalizedHeaders.includes('service')) ||
    // Additional indicators specific to iMessage exports
    (normalizedHeaders.includes('chat session') && normalizedHeaders.includes('service'))
  );
  
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
  const lines = csvContent.split('\n');
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
export const standardizeCommunication = (record: Record<string, string>, fileFormat: FileFormat): CommunicationRecord => {
  if (fileFormat === 'imazing') {
    // iMessage format mapping - enhanced for the user's specific format
    const senderIdField = Object.keys(record).find(k => 
      ['sender id', 'senderid', 'sender', 'from'].includes(k.toLowerCase())
    ) || '';
    
    const typefield = Object.keys(record).find(k => 
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
      ['service', 'platform', 'type'].includes(k.toLowerCase())
    ) || '';
    
    const chatSessionField = Object.keys(record).find(k =>
      ['chat session', 'chat', 'session'].includes(k.toLowerCase())
    ) || '';
    
    // Determine direction based on type field directly
    let direction = 'unknown';
    let phoneNumber = '';
    
    // Try to determine the direction
    if (record[typefield] && typeof record[typefield] === 'string') {
      const typeValue = record[typefield].toLowerCase();
      if (typeValue.includes('incoming')) {
        direction = 'incoming';
      } else if (typeValue.includes('outgoing')) {
        direction = 'outgoing';
      } else if (typeValue.includes('missed')) {
        direction = 'missed';
      }
    }
    
    // If direction is still unknown, try using service field
    if (direction === 'unknown' && record[serviceField]?.toLowerCase()?.includes('imessage')) {
      // For iMessage, we need to determine from the sender and recipient
      const myAppleId = record[senderIdField] || '';
      
      // If sender ID exists and contains '+', it's likely a phone number
      if (record[senderIdField] && record[senderIdField].includes('+')) {
        direction = 'incoming';
        phoneNumber = record[senderIdField];
      } else if (record[chatSessionField]) {
        // Use chat session as a fallback for contact information
        // Often chat session contains the contact name or number
        phoneNumber = record[senderIdField] || record[chatSessionField];
      }
    }
    
    // Set phone number from sender ID if it's a valid phone number format
    if (!phoneNumber && record[senderIdField]) {
      phoneNumber = record[senderIdField];
    }
    
    // Use chat session as a fallback for phone number
    if (!phoneNumber && record[chatSessionField]) {
      phoneNumber = record[chatSessionField];
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
    
    // Get contact name from the sender name field or chat session
    const contactName = record[senderNameField] || record[chatSessionField] || '';
    
    return {
      contact_phone: phoneNumber,
      contact_name: contactName,
      direction: direction,
      type: 'text', // Assuming all are text messages
      content: record[textField] || '',
      timestamp: timestamp,
    };
  } else {
    // Standard format mapping (existing code)
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

    return {
      contact_phone: record[phoneField] || 'unknown',
      contact_name: record[nameField] || '',
      direction: direction,
      type: 'text', // Assuming all are text messages
      content: record[contentField] || '',
      timestamp: timestamp,
    };
  }
};

// Parse file content based on format
export const parseFileContent = async (file: File): Promise<{
  data: CommunicationRecord[];
  fileFormat: FileFormat;
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
        
        // Get headers to detect format
        const headers = lines[0].split(',').map(h => h.trim());
        const fileFormat = detectFileFormat(headers);
        
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
        const standardizedData = parsedRecords.map(record => standardizeCommunication(record, fileFormat));
        
        console.log("Sample standardized record:", standardizedData[0]);
        
        // Filter out records with missing required fields
        const validData = standardizedData.filter(record => 
          record.timestamp !== 'unknown' && 
          (record.direction !== 'unknown' || record.contact_phone !== 'unknown')
        );
        
        if (!validData || validData.length === 0) {
          reject(new Error("No valid data found in the file. Please ensure your CSV contains the required columns for your format type."));
          return;
        }
        
        // Log some stats for debugging
        console.log(`Found ${parsedRecords.length} records, ${validData.length} valid after conversion`);
        
        resolve({ data: validData, fileFormat });
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
