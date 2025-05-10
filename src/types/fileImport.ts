
export interface ImportResult {
  processed: number;
  inserted: number;
  invalid: number;
  invalidRecords: Array<{ record: any; reason: string }>;
  sync_id: string;
}

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  result: ImportResult | null;
  error: string | null;
  parsedData: any[] | null;
  showConfirm: boolean;
  fileFormat: 'standard' | 'imazing' | 'unknown';
}

export interface ScheduledImportSettings {
  enabled: boolean;
  importTime: string;
  watchFolder: string;
  fileFormat: 'json' | 'csv';
  updatedAt: string;
}

export interface UserSettings {
  user_id: string;
  scheduled_import_settings?: ScheduledImportSettings;
  created_at?: string;
  updated_at?: string;
}

export interface ImportFile {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  records_count?: number;
  imported_count?: number;
  error_message?: string;
  uploaded_at: string;
  processed_at?: string;
}
