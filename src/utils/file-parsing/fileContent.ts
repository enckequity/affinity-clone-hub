
import { CommunicationRecord } from "@/types/fileImport";
import { FileFormat } from "../types/fileFormats";
import { parseCSV } from "./csvParser";
import { detectFileFormat } from "./fileFormatDetection";
import { standardizeCommunication } from "./recordNormalization";

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
