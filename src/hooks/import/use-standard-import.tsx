
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CommunicationRecord, ImportResult } from '@/types/fileImport';
import { StandardImportOptions, ImportProgress } from '@/types/importTypes';

export const useStandardImport = () => {
  const { toast } = useToast();

  const processStandardImport = async (
    options: StandardImportOptions, 
    parsedData: CommunicationRecord[],
    userId: string,
    accessToken: string,
    onProgress: (progress: number) => void
  ) => {
    try {
      // Process the data in chunks for large files
      const chunkSize = 500;
      const chunks = [];
      for (let i = 0; i < parsedData.length; i += chunkSize) {
        chunks.push(parsedData.slice(i, i + chunkSize));
      }
      
      let progress: ImportProgress = {
        totalProcessed: 0,
        totalInserted: 0,
        totalSkipped: 0,
        totalInvalid: 0,
        totalIncoming: 0,
        totalOutgoing: 0,
        invalidRecords: [],
        syncId: '',
      };
      
      toast({
        title: "Import started",
        description: `Processing ${parsedData.length} records in ${chunks.length} chunks...`,
      });
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLastChunk = i === chunks.length - 1;
        
        try {
          // Call the edge function to process the chunk
          const response = await supabase.functions.invoke('process-communications-import', {
            body: {
              communications: chunk,
              sync_type: 'manual',
              user_id: userId,
              // If not the first chunk, include the sync ID to append to the same import
              ...(i > 0 && { sync_id: progress.syncId }),
              // Indicate if this is the last chunk
              isLastChunk: isLastChunk,
              // Add force import flag
              forceImport: options.forceImport
            },
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (response.error) {
            console.error("Error response from edge function:", response.error);
            throw new Error(response.error.message || "Failed to process data");
          }
          
          // Update progress based on chunks processed
          onProgress(30 + Math.round(60 * (i + 1) / chunks.length));
          
          // Store the sync ID from the first chunk for subsequent chunks
          if (i === 0) {
            progress.syncId = response.data.sync_id;
          }
          
          // Accumulate results
          progress.totalProcessed += response.data.processed || 0;
          progress.totalInserted += response.data.inserted || 0;
          progress.totalSkipped += response.data.skipped || 0;
          progress.totalInvalid += response.data.invalid || 0;
          
          if (response.data.invalidRecords && response.data.invalidRecords.length > 0) {
            progress.invalidRecords = [...progress.invalidRecords, ...response.data.invalidRecords];
          }
          
          // If we got a partial success (207) status, log it but continue
          if (response.data.status === 'partial_success') {
            console.log(`Chunk ${i} had partial success. Some records were skipped or invalid.`);
          }
        } catch (err: any) {
          console.error("Error response from edge function:", err);
          
          // Continue processing other chunks even if one fails
          progress.totalInvalid += chunk.length;
          progress.invalidRecords.push({
            record: { chunk: `Chunk ${i}`, size: chunk.length },
            reason: err.message || "Failed to process data chunk"
          });
          
          toast({
            title: "Warning: Partial failure",
            description: `Chunk ${i+1} failed: ${err.message}. Continuing with remaining chunks...`,
            variant: "destructive",
          });
          
          // Don't abort the whole import for one chunk failure
          continue;
        }
      }
      
      const result: ImportResult = {
        processed: progress.totalProcessed,
        inserted: progress.totalInserted,
        skipped: progress.totalSkipped,
        invalid: progress.totalInvalid,
        invalidRecords: progress.invalidRecords,
        sync_id: progress.syncId
      };
      
      // Customize message based on results
      let resultMessage = `Successfully imported ${progress.totalInserted} messages.`;
      if (progress.totalSkipped > 0) {
        resultMessage += ` ${progress.totalSkipped} duplicate records were skipped.`;
      }
      if (progress.totalInvalid > 0) {
        resultMessage += ` ${progress.totalInvalid} invalid records were found.`;
      }
      
      toast({
        title: "Import successful",
        description: resultMessage,
      });
      
      return result;
    } catch (err: any) {
      console.error("Error in standard import:", err);
      throw err;
    }
  };

  return { processStandardImport };
};
