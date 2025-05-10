import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { FileUploadState, ImportResult } from '@/types/fileImport';
import { parseFileContent, processCSVInChunks } from '@/utils/fileParsingUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useFileImport = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<FileUploadState>({
    file: null,
    isUploading: false,
    uploadProgress: 0,
    result: null,
    error: null,
    parsedData: null,
    showConfirm: false,
    fileFormat: 'unknown',
    forceImport: false,
    processingMode: 'standard'
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Reset states
    setState(prev => ({
      ...prev,
      file: selectedFile,
      error: null,
      result: null,
      parsedData: null,
      showConfirm: false,
      fileFormat: 'unknown',
      uploadProgress: 0
    }));
    
    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setState(prev => ({
        ...prev,
        error: "Please upload a CSV file"
      }));
      return;
    }
    
    // Parse the file based on processing mode
    try {
      toast({
        title: "Processing file",
        description: "Analyzing your CSV file format...",
      });
      
      if (state.processingMode === 'bulk') {
        // For bulk mode, we don't parse the entire file yet
        // We'll just check the headers to identify the format
        const chunk = await selectedFile.slice(0, 1000).text();
        const firstLineEnd = chunk.indexOf('\n');
        if (firstLineEnd !== -1) {
          const headerLine = chunk.substring(0, firstLineEnd);
          const headers = headerLine.split(',').map(h => h.trim());
          const fileFormat = headers.some(h => 
            h.toLowerCase().includes('chat session') || 
            h.toLowerCase().includes('message date')
          ) ? 'imazing' : 'standard';
          
          setState(prev => ({
            ...prev,
            fileFormat,
            showConfirm: true,
          }));
          
          toast({
            title: "File format detected",
            description: `Detected format: ${fileFormat === 'imazing' ? 'iMessage Export' : 'Standard CSV'}. Ready for bulk import.`,
          });
        } else {
          throw new Error("Could not detect CSV format");
        }
      } else {
        // Standard mode - parse the whole file in memory
        const { data, fileFormat, skippedRecords } = await parseFileContent(selectedFile, state.forceImport);
        
        setState(prev => ({
          ...prev,
          parsedData: data,
          showConfirm: true,
          fileFormat
        }));
        
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
      }
    } catch (err: any) {
      console.error("Error parsing file:", err);
      setState(prev => ({
        ...prev,
        error: `Failed to parse file: ${err.message}`
      }));
      
      toast({
        title: "Error parsing file",
        description: err.message || "Failed to parse the CSV file.",
        variant: "destructive",
      });
    }
  };
  
  const toggleForceImport = () => {
    setState(prev => ({
      ...prev,
      forceImport: !prev.forceImport
    }));
    
    // If we already have a file selected, re-parse it with the new setting
    if (state.file) {
      reparseCurrentFile();
    }
  };
  
  const setProcessingMode = (mode: 'standard' | 'bulk') => {
    setState(prev => ({
      ...prev,
      processingMode: mode
    }));
  };
  
  const reparseCurrentFile = async () => {
    if (!state.file) return;
    
    try {
      toast({
        title: "Reprocessing file",
        description: "Analyzing your CSV file with new settings...",
      });
      
      const { data, fileFormat, skippedRecords } = await parseFileContent(state.file, !state.forceImport);
      
      setState(prev => ({
        ...prev,
        parsedData: data,
        showConfirm: true,
        fileFormat
      }));
      
      // Show toast with the detected format and record count
      let formatName = 'Unknown';
      if (fileFormat === 'imazing') formatName = 'iMessage Export';
      else if (fileFormat === 'standard') formatName = 'Standard CSV';
      
      let toastMessage = `Detected format: ${formatName}. Found ${data.length} records.`;
      if (skippedRecords.length > 0) {
        toastMessage += ` (${skippedRecords.length} records skipped during parsing)`;
      }
      
      toast({
        title: "File reparsed successfully",
        description: toastMessage,
      });
    } catch (err: any) {
      console.error("Error parsing file:", err);
      setState(prev => ({
        ...prev,
        error: `Failed to parse file: ${err.message}`
      }));
      
      toast({
        title: "Error parsing file",
        description: err.message || "Failed to parse the CSV file.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpload = async () => {
    if (!state.file) return;
    
    try {
      setState(prev => ({ ...prev, isUploading: true, uploadProgress: 5 }));
      
      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Authentication required. Please log in.");
      }
      
      setState(prev => ({ ...prev, uploadProgress: 10 }));
      
      if (state.processingMode === 'bulk') {
        // Bulk import mode
        // Process CSV in chunks
        setState(prev => ({ ...prev, uploadProgress: 15 }));
        
        const { chunks, fileFormat, skippedRows } = await processCSVInChunks(state.file, 500, (progress) => {
          setState(prev => ({ ...prev, uploadProgress: 15 + Math.floor(progress * 0.3) }));
        });
        
        setState(prev => ({ ...prev, uploadProgress: 45 }));
        
        toast({
          title: "File parsed",
          description: `Parsed ${chunks.reduce((acc, chunk) => acc + chunk.length, 0)} records. Starting import...`,
        });
        
        let totalProcessed = 0;
        let totalInserted = 0;
        let totalSkipped = 0;
        let totalInvalid = 0;
        let totalIncoming = 0;
        let totalOutgoing = 0;
        let invalidRecords: Array<{ record: any; reason: string }> = [];
        let syncId = '';
        let allUnmatchedPhones: string[] = [];
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const isLastChunk = i === chunks.length - 1;
          
          try {
            // Call the edge function to process the chunk
            const response = await supabase.functions.invoke('process-communications-import', {
              body: {
                communications: chunk,
                sync_type: 'import',
                user_id: session.user.id,
                fileFormat: fileFormat,
                // If not the first chunk, include the sync ID to append to the same import
                ...(i > 0 && { sync_id: syncId }),
                // Indicate if this is the last chunk
                isLastChunk: isLastChunk,
                // Add force import flag
                forceImport: state.forceImport
              },
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            });
            
            if (response.error) {
              console.error("Error response from edge function:", response.error);
              throw new Error(response.error.message || "Failed to process data");
            }
            
            // Update progress based on chunks processed
            setState(prev => ({ 
              ...prev, 
              uploadProgress: 45 + Math.round(50 * (i + 1) / chunks.length)
            }));
            
            // Store the sync ID from the first chunk for subsequent chunks
            if (i === 0) {
              syncId = response.data.sync_id;
            }
            
            // Accumulate results
            totalProcessed += response.data.processed || 0;
            totalInserted += response.data.inserted || 0;
            totalSkipped += response.data.skipped || 0;
            totalInvalid += response.data.invalid || 0;
            totalIncoming += response.data.incoming || 0;
            totalOutgoing += response.data.outgoing || 0;
            
            // Collect unmatched phones
            if (response.data.unmatchedPhones && response.data.unmatchedPhones.length > 0) {
              allUnmatchedPhones = [...allUnmatchedPhones, ...response.data.unmatchedPhones];
            }
            
            if (response.data.invalidRecords && response.data.invalidRecords.length > 0) {
              invalidRecords = [...invalidRecords, ...response.data.invalidRecords];
            }
            
            // If we got a partial success (207) status, log it but continue
            if (response.data.status === 'partial_success') {
              console.log(`Chunk ${i+1} had partial success. Some records were skipped or invalid.`);
            }
          } catch (err: any) {
            console.error("Error processing chunk:", err);
            
            // Continue processing other chunks even if one fails
            totalInvalid += chunk.length;
            invalidRecords.push({
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
        const uniqueUnmatchedPhones = [...new Set(allUnmatchedPhones)];
        
        setState(prev => ({
          ...prev,
          uploadProgress: 100,
          result: {
            processed: totalProcessed,
            inserted: totalInserted,
            skipped: totalSkipped,
            invalid: totalInvalid,
            incoming: totalIncoming,
            outgoing: totalOutgoing,
            invalidRecords,
            sync_id: syncId,
            unmatchedPhones: uniqueUnmatchedPhones
          }
        }));
        
        // Customize message based on results
        let resultMessage = `Successfully imported ${totalInserted} messages (${totalIncoming} incoming, ${totalOutgoing} outgoing).`;
        if (totalSkipped > 0) {
          resultMessage += ` ${totalSkipped} duplicate records were skipped.`;
        }
        if (totalInvalid > 0) {
          resultMessage += ` ${totalInvalid} invalid records were found.`;
        }
        
        // If there are unmatched phones, offer to resolve them
        if (uniqueUnmatchedPhones.length > 0) {
          toast({
            title: "Import successful",
            description: `${resultMessage} ${uniqueUnmatchedPhones.length} phone numbers need to be resolved.`,
            action: uniqueUnmatchedPhones.length > 0 ? {
              label: "Resolve Contacts",
              onClick: () => navigate('/import/resolve-contacts')
            } : undefined
          });
        } else {
          toast({
            title: "Import successful",
            description: resultMessage
          });
        }
        
      } else {
        // Standard import mode (existing functionality)
        if (!state.parsedData) return;
    
        try {
          setState(prev => ({ ...prev, isUploading: true, uploadProgress: 10 }));
          
          // Get user session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            throw new Error("Authentication required. Please log in.");
          }
          
          setState(prev => ({ ...prev, uploadProgress: 30 }));
          
          // Process the data in chunks for large files
          const chunkSize = 500;
          const chunks = [];
          for (let i = 0; i < state.parsedData.length; i += chunkSize) {
            chunks.push(state.parsedData.slice(i, i + chunkSize));
          }
          
          let totalProcessed = 0;
          let totalInserted = 0;
          let totalSkipped = 0;
          let totalInvalid = 0;
          let invalidRecords: Array<{ record: any; reason: string }> = [];
          let syncId = '';
          
          toast({
            title: "Import started",
            description: `Processing ${state.parsedData.length} records in ${chunks.length} chunks...`,
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
                  user_id: session.user.id,
                  // If not the first chunk, include the sync ID to append to the same import
                  ...(i > 0 && { sync_id: syncId }),
                  // Indicate if this is the last chunk
                  isLastChunk: isLastChunk,
                  // Add force import flag
                  forceImport: state.forceImport
                },
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                }
              });
              
              if (response.error) {
                console.error("Error response from edge function:", response.error);
                throw new Error(response.error.message || "Failed to process data");
              }
              
              // Update progress based on chunks processed
              setState(prev => ({ 
                ...prev, 
                uploadProgress: 30 + Math.round(60 * (i + 1) / chunks.length)
              }));
              
              // Store the sync ID from the first chunk for subsequent chunks
              if (i === 0) {
                syncId = response.data.sync_id;
              }
              
              // Accumulate results
              totalProcessed += response.data.processed || 0;
              totalInserted += response.data.inserted || 0;
              totalSkipped += response.data.skipped || 0;
              totalInvalid += response.data.invalid || 0;
              
              if (response.data.invalidRecords && response.data.invalidRecords.length > 0) {
                invalidRecords = [...invalidRecords, ...response.data.invalidRecords];
              }
              
              // If we got a partial success (207) status, log it but continue
              if (response.data.status === 'partial_success') {
                console.log(`Chunk ${i} had partial success. Some records were skipped or invalid.`);
              }
            } catch (err: any) {
              console.error("Error response from edge function:", err);
              
              // Continue processing other chunks even if one fails
              totalInvalid += chunk.length;
              invalidRecords.push({
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
          
          setState(prev => ({
            ...prev,
            uploadProgress: 100,
            result: {
              processed: totalProcessed,
              inserted: totalInserted,
              skipped: totalSkipped,
              invalid: totalInvalid,
              invalidRecords,
              sync_id: syncId
            }
          }));
          
          // Customize message based on results
          let resultMessage = `Successfully imported ${totalInserted} messages.`;
          if (totalSkipped > 0) {
            resultMessage += ` ${totalSkipped} duplicate records were skipped.`;
          }
          if (totalInvalid > 0) {
            resultMessage += ` ${totalInvalid} invalid records were found.`;
          }
          
          toast({
            title: "Import successful",
            description: resultMessage,
          });
          
        } catch (err: any) {
          console.error("Error uploading file:", err);
          setState(prev => ({
            ...prev,
            error: err.message || "An error occurred during upload"
          }));
          
          toast({
            title: "Import failed",
            description: err.message || "Failed to import communications",
            variant: "destructive",
          });
        }
      }
      
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setState(prev => ({
        ...prev,
        error: err.message || "An error occurred during upload"
      }));
      
      toast({
        title: "Import failed",
        description: err.message || "Failed to import communications",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({
        ...prev,
        isUploading: false,
        showConfirm: false
      }));
    }
  };
  
  const resetForm = () => {
    setState({
      file: null,
      isUploading: false,
      uploadProgress: 0,
      result: null,
      error: null,
      parsedData: null,
      showConfirm: false,
      fileFormat: 'unknown',
      forceImport: false,
      processingMode: state.processingMode // Keep the current processing mode
    });
  };

  return {
    state,
    handleFileChange,
    handleUpload,
    resetForm,
    toggleForceImport,
    setProcessingMode
  };
};
