
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
