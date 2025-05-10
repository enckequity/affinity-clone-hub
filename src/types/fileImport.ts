
export interface CommunicationRecord {
  contact_phone: string;
  contact_name?: string;
  direction: 'incoming' | 'outgoing' | 'missed' | 'unknown';
  type: 'call' | 'text';
  content?: string;
  duration?: number;
  timestamp: string;
  chat_session?: string;
}

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  result: ImportResult | null;
  error: string | null;
  parsedData: CommunicationRecord[] | null;
  showConfirm: boolean;
  fileFormat: 'standard' | 'imazing' | 'unknown';
  forceImport?: boolean;
}

export interface ImportResult {
  processed: number;
  inserted: number;
  skipped?: number;
  invalid: number;
  invalidRecords?: Array<{ record: any; reason: string }>;
  sync_id: string;
}

// Add the missing UserSettings interface
export interface UserSettings {
  user_id: string;
  id?: string;
  daily_import_time?: string;
  import_enabled?: boolean;
  last_import_date?: string;
  created_at?: string;
  updated_at?: string;
}
