
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { FileUploadForm } from './FileUploadForm';
import { ImportResultDisplay } from './ImportResultDisplay';
import { parseFileContent } from '@/utils/fileParsingUtils';
import { FileUploadState, ImportResult } from '@/types/fileImport';
import { useAuth } from '@/contexts/AuthContext';

export function FileImport() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [state, setState] = useState<FileUploadState>({
    file: null,
    isUploading: false,
    uploadProgress: 0,
    result: null,
    error: null,
    parsedData: null,
    showConfirm: false,
    fileFormat: 'unknown'
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
    
    // Parse the file
    try {
      const { data, fileFormat } = await parseFileContent(selectedFile);
      
      setState(prev => ({
        ...prev,
        parsedData: data,
        showConfirm: true,
        fileFormat
      }));
      
      // Show toast with the detected format
      toast({
        title: "File parsed successfully",
        description: `Detected format: ${fileFormat === 'imazing' ? 'iMessage Export' : fileFormat === 'standard' ? 'Standard CSV' : 'Unknown'}`,
      });
    } catch (err: any) {
      console.error("Error parsing file:", err);
      setState(prev => ({
        ...prev,
        error: `Failed to parse file: ${err.message}`
      }));
    }
  };
  
  const handleUpload = async () => {
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
      let totalInvalid = 0;
      let invalidRecords: Array<{ record: any; reason: string }> = [];
      let syncId = '';
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          // Call the edge function to process the chunk
          const response = await supabase.functions.invoke('process-communications-import', {
            body: {
              communications: chunk,
              sync_type: 'import',
              user_id: session.user.id,
              // If not the first chunk, include the sync ID to append to the same import
              ...(i > 0 && { sync_id: syncId })
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
          totalProcessed += response.data.processed;
          totalInserted += response.data.inserted;
          totalInvalid += response.data.invalid;
          invalidRecords = [...invalidRecords, ...response.data.invalidRecords];
        } catch (err: any) {
          console.error("Error response from edge function:", err);
          throw new Error(err.message || "Failed to process data chunk");
        }
      }
      
      setState(prev => ({
        ...prev,
        uploadProgress: 100,
        result: {
          processed: totalProcessed,
          inserted: totalInserted,
          invalid: totalInvalid,
          invalidRecords,
          sync_id: syncId
        }
      }));
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${totalInserted} messages.`,
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
      fileFormat: 'unknown'
    });
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Import CSV</CardTitle>
          <CardDescription>
            Upload communication data from your CSV files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!state.result ? (
            <FileUploadForm 
              state={state}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
              onReset={resetForm}
            />
          ) : (
            <ImportResultDisplay
              result={state.result}
              onReset={resetForm}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
