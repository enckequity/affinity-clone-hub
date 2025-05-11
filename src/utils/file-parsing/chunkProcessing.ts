
import { FileFormat } from "../types/fileFormats";
import Papa from 'papaparse';
import { detectFileFormat } from "./fileFormatDetection";

// Stream parse a large CSV file in chunks
export const parseCSVInChunks = (file: File, chunkSize: number = 500, onProgress?: (progress: number) => void): Promise<{
  data: any[];
  fileFormat: FileFormat;
  skippedRows: number;
}> => {
  return new Promise((resolve, reject) => {
    const allData: any[] = [];
    let headers: string[] = [];
    let fileFormat: FileFormat = 'unknown';
    let skippedRows = 0;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      beforeFirstChunk: function(chunk) {
        // Get headers from the first chunk to determine format
        const firstLineEnd = chunk.indexOf('\n');
        if (firstLineEnd !== -1) {
          const headerLine = chunk.substring(0, firstLineEnd);
          headers = headerLine.split(',').map(h => h.trim());
          fileFormat = detectFileFormat(headers);
        }
        return chunk;
      },
      step: function(results) {
        if (results.errors.length > 0) {
          skippedRows++;
          return;
        }
        
        const row = results.data;
        if (row && Object.keys(row).length > 0) {
          allData.push(row);
        }
      },
      complete: function() {
        resolve({ 
          data: allData, 
          fileFormat,
          skippedRows 
        });
      },
      error: function(error) {
        reject(error);
      }
    });
  });
};

// Process CSV data in chunks
export const processCSVInChunks = async (file: File, chunkSize: number = 500, onProgress?: (progress: number) => void): Promise<{
  data: any[];
  chunks: any[][];
  fileFormat: FileFormat;
  skippedRows: number;
}> => {
  const { data, fileFormat, skippedRows } = await parseCSVInChunks(file);
  
  // Break data into chunks
  const chunks: any[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  
  // Report progress
  if (onProgress) {
    onProgress(100);
  }
  
  return { data, chunks, fileFormat, skippedRows };
};
