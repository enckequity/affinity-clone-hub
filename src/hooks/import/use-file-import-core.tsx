
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { FileUploadState } from '@/types/fileImport';
import { useFileParsing } from './use-file-parsing';
import { useStandardImport } from './use-standard-import';
import { useBulkImport } from './use-bulk-import';
import { useImportState } from './use-import-state';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Core hook for handling file imports
 * Orchestrates the file parsing, standard import, and bulk import processes
 */
export const useFileImportCore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { parseFile, processCSVChunks } = useFileParsing();
  const { processStandardImport } = useStandardImport();
  const { processBulkImport } = useBulkImport();
  const { state, setState, resetState, toggleForceImport, setProcessingMode } = useImportState();
  
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
        ...result,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: `Failed to parse file: ${err.message}`
      }));
    }
  };
  
  const reparseCurrentFile = async () => {
    if (!state.file) return;
    
    try {
      const result = await parseFile(state.file, !state.forceImport, state.processingMode);
      setState(prev => ({
        ...prev,
        ...result,
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

  return {
    state,
    handleFileChange,
    handleUpload,
    resetForm: resetState,
    toggleForceImport,
    setProcessingMode,
    reparseCurrentFile
  };
};
