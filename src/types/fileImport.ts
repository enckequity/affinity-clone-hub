
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

export interface UserSettings {
  id: string;
  user_id: string;
  daily_import_time: string | null;
  import_enabled: boolean;
  last_import_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CommunicationRecord {
  contact_phone: string;
  contact_name?: string;
  direction: string;
  type: string;
  content?: string;
  timestamp: string;
  duration?: number;
}
