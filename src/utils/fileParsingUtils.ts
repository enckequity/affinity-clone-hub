
import { ImportResult } from "@/types/fileImport";

// Interface for iMazing CSV format
export interface IMazingRecord {
  'Chat Session'?: string;
  'Message Date'?: string;
  'Delivered Date'?: string;
  'Read Date'?: string;
  'Edited Date'?: string;
  'Service'?: string;
  'Type'?: string;
  'Sender ID'?: string;
  'Sender Name'?: string;
  'Status'?: string;
  'Replying to'?: string;
  'Subject'?: string;
  'Text'?: string;
  'Attachment'?: string;
  'Attachment type'?: string;
}

export interface CommunicationRecord {
  contact_phone: string;
  contact_name?: string;
  direction: string;
  type: string;
  content?: string;
  timestamp: string;
  duration?: number;
}

export type FileFormat = 'standard' | 'imazing' | 'unknown';

// Function to detect file format based on headers
export const detectFileFormat = (headers: string[]): FileFormat => {
  const isIMazingFormat = headers.includes('Chat Session') && 
                          headers.includes('Message Date') && 
                          headers.includes('Type') && 
                          headers.includes('Sender ID');
  
  return isIMazingFormat ? 'imazing' : 'standard';
};

// Function to parse iMazing CSV format (tab-separated)
export const parseIMazingCSV = (csvContent: string): CommunicationRecord[] => {
  try {
    const lines = csvContent.split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());
    
    // Parse each line into an object with the headers as keys
    const iMazingRecords: IMazingRecord[] = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split('\t');
        const record: Record<string, string> = {};
        
        headers.forEach((header, i) => {
          record[header] = values[i]?.trim() || '';
        });
        
        return record as IMazingRecord;
      });
    
    // Convert iMazing records to our communications format
    return iMazingRecords.map(record => {
      // Determine direction based on Type field
      let direction: string;
      if (record['Type'] === 'Outgoing') {
        direction = 'outgoing';
      } else if (record['Type'] === 'Incoming') {
        direction = 'incoming';
      } else {
        direction = 'unknown';
      }
      
      // Map iMazing format to our communications format
      return {
        contact_phone: record['Sender ID'] || '',
        contact_name: record['Sender Name'] || record['Chat Session'] || '',
        direction: direction,
        type: 'text', // Assuming all iMessage/SMS are text type
        content: record['Text'] || '',
        timestamp: record['Message Date'] || new Date().toISOString(),
      };
    }).filter(record => record.contact_phone && record.timestamp);
  } catch (error) {
    console.error("Error parsing iMazing CSV:", error);
    throw new Error("Failed to parse iMazing CSV format");
  }
};

// Function to parse standard CSV format
export const parseStandardCSV = (csvContent: string): any[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return null; // Skip empty lines
    
    const values = line.split(',');
    const obj: Record<string, string> = {};
    
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim() || '';
    });
    
    return obj;
  }).filter(Boolean);
};

// Function to parse file content based on format
export const parseFileContent = async (file: File): Promise<{
  data: any[];
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
        
        let data: any[];
        let fileFormat: FileFormat = 'unknown';
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(event.target.result as string);
          if (!Array.isArray(data)) {
            data = [data]; // Convert object to array if it's not already an array
          }
          fileFormat = 'standard';
        } else {
          // CSV parsing
          const csv = event.target.result as string;
          const lines = csv.split('\n');
          
          // Check if this is a tab-separated file (iMazing format)
          const firstLine = lines[0];
          const isTabSeparated = firstLine.includes('\t');
          const separator = isTabSeparated ? '\t' : ',';
          
          const headers = lines[0].split(separator).map(h => h.trim());
          
          fileFormat = detectFileFormat(headers);
          
          if (fileFormat === 'imazing') {
            data = parseIMazingCSV(csv);
          } else {
            // Standard CSV parsing
            data = parseStandardCSV(csv);
          }
        }
        
        if (!data || data.length === 0) {
          reject(new Error("No valid data found in the file"));
          return;
        }
        
        resolve({ data, fileFormat });
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
