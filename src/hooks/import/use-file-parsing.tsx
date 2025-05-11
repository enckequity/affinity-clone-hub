
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { FileUploadState } from '@/types/fileImport';
import { parseFileContent, processCSVInChunks } from '@/utils/fileParsingUtils';

export const useFileParsing = () => {
  const { toast } = useToast();
  
  const parseFile = async (file: File, forceImport: boolean, processingMode: 'standard' | 'bulk') => {
    try {
      toast({
        title: "Processing file",
        description: "Analyzing your CSV file format...",
      });
      
      if (processingMode === 'bulk') {
        // For bulk mode, check headers to identify format
        const chunk = await file.slice(0, 1000).text();
        const firstLineEnd = chunk.indexOf('\n');
        
        if (firstLineEnd !== -1) {
          const headerLine = chunk.substring(0, firstLineEnd);
          const headers = headerLine.split(',').map(h => h.trim());
          const fileFormat = headers.some(h => 
            h.toLowerCase().includes('chat session') || 
            h.toLowerCase().includes('message date')
          ) ? 'imazing' : 'standard';
          
          toast({
            title: "File format detected",
            description: `Detected format: ${fileFormat === 'imazing' ? 'iMessage Export' : 'Standard CSV'}. Ready for bulk import.`,
          });
          
          return {
            fileFormat: fileFormat as 'standard' | 'imazing' | 'unknown',
            showConfirm: true,
            parsedData: null
          };
        } else {
          throw new Error("Could not detect CSV format");
        }
      } else {
        // Standard mode - parse the whole file in memory
        const { data, fileFormat, skippedRecords } = await parseFileContent(file, forceImport);
        
        // Show toast with the detected format and record count
        let formatName = 'Unknown';
        if (fileFormat === 'imazing') formatName = 'iMessage Export';
        else if (fileFormat === 'standard') formatName = 'Standard CSV';
        
        let toastMessage = `Detected format: ${formatName}. Found ${data.length} records.`;
        if (skippedRecords.length > 0) {
          toastMessage += ` (${skippedRecords.length} records skipped during parsing)`;
        }
        
        toast({
          title: "File parsed successfully",
          description: toastMessage,
        });
        
        return {
          parsedData: data,
          showConfirm: true,
          fileFormat: fileFormat
        };
      }
    } catch (err: any) {
      console.error("Error parsing file:", err);
      
      toast({
        title: "Error parsing file",
        description: err.message || "Failed to parse the CSV file.",
        variant: "destructive",
      });
      
      throw err;
    }
  };

  const processCSVChunks = async (file: File, onProgress?: (progress: number) => void) => {
    try {
      const { chunks, fileFormat, skippedRows } = await processCSVInChunks(file, 500, (progress) => {
        if (onProgress) onProgress(progress);
      });
      
      return { chunks, fileFormat, skippedRows };
    } catch (err: any) {
      console.error("Error processing CSV chunks:", err);
      throw err;
    }
  };

  return {
    parseFile,
    processCSVChunks
  };
};
