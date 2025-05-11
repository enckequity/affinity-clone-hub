
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { ImportResult } from '@/types/fileImport';
import { BulkImportOptions, ImportProgress } from '@/types/importTypes';
import { ToastAction } from "@/components/ui/toast";
import { useNavigate } from 'react-router-dom';

export const useBulkImport = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const processBulkImport = async (
    options: BulkImportOptions,
    chunks: any[][],
    fileFormat: string,
    userId: string,
    accessToken: string,
    onProgress: (progress: number) => void
  ) => {
    try {
      toast({
        title: "File parsed",
        description: `Parsed ${chunks.reduce((acc, chunk) => acc + chunk.length, 0)} records. Starting import...`,
      });
      
      let progress: ImportProgress = {
        totalProcessed: 0,
        totalInserted: 0,
        totalSkipped: 0,
        totalInvalid: 0,
        totalIncoming: 0,
        totalOutgoing: 0,
        invalidRecords: [],
        syncId: '',
        unmatchedPhones: [],
      };
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLastChunk = i === chunks.length - 1;
        
        try {
          // Call the edge function to process the chunk
          const response = await supabase.functions.invoke('process-communications-import', {
            body: {
              communications: chunk,
              sync_type: 'import',
              user_id: userId,
              fileFormat: fileFormat,
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
          onProgress(45 + Math.round(50 * (i + 1) / chunks.length));
          
          // Store the sync ID from the first chunk for subsequent chunks
          if (i === 0) {
            progress.syncId = response.data.sync_id;
          }
          
          // Accumulate results
          progress.totalProcessed += response.data.processed || 0;
          progress.totalInserted += response.data.inserted || 0;
          progress.totalSkipped += response.data.skipped || 0;
          progress.totalInvalid += response.data.invalid || 0;
          progress.totalIncoming += response.data.incoming || 0;
          progress.totalOutgoing += response.data.outgoing || 0;
          
          // Collect unmatched phones
          if (response.data.unmatchedPhones && response.data.unmatchedPhones.length > 0) {
            progress.unmatchedPhones = [...(progress.unmatchedPhones || []), ...response.data.unmatchedPhones];
          }
          
          if (response.data.invalidRecords && response.data.invalidRecords.length > 0) {
            progress.invalidRecords = [...progress.invalidRecords, ...response.data.invalidRecords];
          }
          
          // If we got a partial success (207) status, log it but continue
          if (response.data.status === 'partial_success') {
            console.log(`Chunk ${i+1} had partial success. Some records were skipped or invalid.`);
          }
        } catch (err: any) {
          console.error("Error processing chunk:", err);
          
          // Continue processing other chunks even if one fails
          progress.totalInvalid += chunk.length;
          progress.invalidRecords.push({
            record: { chunk: `Chunk ${i+1}`, size: chunk.length },
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
      
      // Remove duplicates from unmatchedPhones
      const uniqueUnmatchedPhones = progress.unmatchedPhones ? [...new Set(progress.unmatchedPhones)] : [];
      
      const result: ImportResult = {
        processed: progress.totalProcessed,
        inserted: progress.totalInserted,
        skipped: progress.totalSkipped,
        invalid: progress.totalInvalid,
        incoming: progress.totalIncoming,
        outgoing: progress.totalOutgoing,
        invalidRecords: progress.invalidRecords,
        sync_id: progress.syncId,
        unmatchedPhones: uniqueUnmatchedPhones
      };
      
      // Customize message based on results
      let resultMessage = `Successfully imported ${progress.totalInserted} messages (${progress.totalIncoming} incoming, ${progress.totalOutgoing} outgoing).`;
      if (progress.totalSkipped > 0) {
        resultMessage += ` ${progress.totalSkipped} duplicate records were skipped.`;
      }
      if (progress.totalInvalid > 0) {
        resultMessage += ` ${progress.totalInvalid} invalid records were found.`;
      }
      
      // If there are unmatched phones, offer to resolve them
      if (uniqueUnmatchedPhones.length > 0) {
        toast({
          title: "Import successful",
          description: `${resultMessage} ${uniqueUnmatchedPhones.length} phone numbers need to be resolved.`,
          action: (
            <ToastAction altText="Resolve Contacts" onClick={() => navigate('/import/resolve-contacts')}>
              Resolve Contacts
            </ToastAction>
          )
        });
      } else {
        toast({
          title: "Import successful",
          description: resultMessage
        });
      }
      
      return result;
    } catch (err: any) {
      console.error("Error in bulk import:", err);
      throw err;
    }
  };

  return { processBulkImport };
};
