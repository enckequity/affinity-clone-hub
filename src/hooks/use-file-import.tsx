
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { FileUploadState } from '@/types/fileImport';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFileParsing } from '@/hooks/import/use-file-parsing';
import { useStandardImport } from '@/hooks/import/use-standard-import';
import { useBulkImport } from '@/hooks/import/use-bulk-import';

export const useFileImport = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { parseFile, processCSVChunks } = useFileParsing();
  const { processStandardImport } = useStandardImport();
  const { processBulkImport } = useBulkImport();

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
      const result = await parseFile(selectedFile, state.forceImport, state.processingMode);
      setState(prev => ({
        ...prev,
        ...result
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: `Failed to parse file: ${err.message}`
      }));
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
      const result = await parseFile(state.file, !state.forceImport, state.processingMode);
      setState(prev => ({
        ...prev,
        ...result
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: `Failed to parse file: ${err.message}`
      }));
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
        setState(prev => ({ ...prev, uploadProgress: 15 }));
        
        const { chunks, fileFormat } = await processCSVChunks(state.file, (progress) => {
          setState(prev => ({ ...prev, uploadProgress: 15 + Math.floor(progress * 0.3) }));
        });
        
        setState(prev => ({ ...prev, uploadProgress: 45 }));
        
        const result = await processBulkImport(
          { file: state.file, forceImport: state.forceImport },
          chunks,
          fileFormat,
          session.user.id,
          session.access_token,
          (progress) => setState(prev => ({ ...prev, uploadProgress: progress }))
        );
        
        setState(prev => ({
          ...prev,
          uploadProgress: 100,
          result
        }));
        
      } else {
        // Standard import mode
        if (!state.parsedData) return;
        
        setState(prev => ({ ...prev, uploadProgress: 30 }));
        
        const result = await processStandardImport(
          { file: state.file, forceImport: state.forceImport },
          state.parsedData,
          session.user.id,
          session.access_token,
          (progress) => setState(prev => ({ ...prev, uploadProgress: progress }))
        );
        
        setState(prev => ({
          ...prev,
          uploadProgress: 100,
          result
        }));
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
