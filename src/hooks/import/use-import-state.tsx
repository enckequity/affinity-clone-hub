
import { useState } from 'react';
import { FileUploadState } from '@/types/fileImport';

/**
 * Hook for managing import state
 */
export const useImportState = () => {
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
  
  const resetState = () => {
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
  
  const toggleForceImport = () => {
    setState(prev => ({
      ...prev,
      forceImport: !prev.forceImport
    }));
  };
  
  const setProcessingMode = (mode: 'standard' | 'bulk') => {
    setState(prev => ({
      ...prev,
      processingMode: mode
    }));
  };
  
  return {
    state,
    setState,
    resetState,
    toggleForceImport,
    setProcessingMode
  };
};
