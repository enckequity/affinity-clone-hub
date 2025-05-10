
import { CommunicationRecord } from "@/types/fileImport";

export type FileFormat = 'standard' | 'imazing' | 'unknown';

// Function to detect file format based on headers
export const detectFileFormat = (headers: string[]): FileFormat => {
  // Detect standard format with columns matching the example
  const isStandardFormat = headers.includes('phone') && 
                          (headers.includes('timestamp') || headers.includes('date')) &&
                          (headers.includes('text') || headers.includes('message') || headers.includes('content'));
  
  return isStandardFormat ? 'standard' : 'unknown';
};

// Function to parse CSV format
export const parseCSV = (csvContent: string): any[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return null; // Skip empty lines
    
    // Handle quoted values properly (simple implementation)
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
export const standardizeCommunication = (record: Record<string, string>): CommunicationRecord => {
  // Map common field names to our standard format
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
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const fileFormat = detectFileFormat(headers);
        
        // Parse CSV
        const parsedRecords = parseCSV(csv);
        
        // Convert to standardized format
        const standardizedData = parsedRecords.map(standardizeCommunication);
        
        // Filter out records with missing required fields
        const validData = standardizedData.filter(record => 
          record.contact_phone !== 'unknown' && 
          record.timestamp !== 'unknown'
        );
        
        if (!validData || validData.length === 0) {
          reject(new Error("No valid data found in the file. Please ensure your CSV contains phone number and timestamp columns."));
          return;
        }
        
        resolve({ data: validData, fileFormat });
      } catch (err: any) {
        reject(err);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    
    reader.readAsText(file);
  });
};
