
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { FileUploadForm } from './FileUploadForm';
import { ImportResultDisplay } from './ImportResultDisplay';
import { parseFileContent } from '@/utils/fileParsingUtils';
import { FileUploadState, ImportResult } from '@/types/fileImport';

export function FileImport() {
  const { toast } = useToast();
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
    if (!selectedFile.name.endsWith('.json') && !selectedFile.name.endsWith('.csv')) {
      setState(prev => ({
        ...prev,
        error: "Please upload a JSON or CSV file"
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
      
      // Call the edge function to process the data
      const response = await supabase.functions.invoke('process-communications-import', {
        body: {
          communications: state.parsedData,
          sync_type: 'import',
          user_id: session.user.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      setState(prev => ({ ...prev, uploadProgress: 90 }));
      
      if (response.error) {
        console.error("Error response from edge function:", response.error);
        throw new Error(response.error.message || "Failed to process data");
      }
      
      setState(prev => ({
        ...prev,
        uploadProgress: 100,
        result: response.data as ImportResult
      }));
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${response.data.inserted} communications.`,
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
    <Card>
      <CardHeader>
        <CardTitle>Import Communications</CardTitle>
        <CardDescription>
          Upload communication data from your device
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
      <CardFooter>
        {/* Footer content if needed */}
      </CardFooter>
    </Card>
  );
}
