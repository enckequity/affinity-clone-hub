
import { useFileImportCore } from './import/use-file-import-core';
import { supabase } from '@/integrations/supabase/client';

/**
 * Main hook for file importing functionality
 * This hook provides a simplified interface for components to use
 */
export const useFileImport = () => {
  const {
    state,
    handleFileChange,
    handleUpload,
    resetForm,
    toggleForceImport,
    setProcessingMode,
    reparseCurrentFile
  } = useFileImportCore();

  return {
    state,
    handleFileChange,
    handleUpload,
    resetForm,
    toggleForceImport,
    setProcessingMode,
    reparseCurrentFile
  };
};
