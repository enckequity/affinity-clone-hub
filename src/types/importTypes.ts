
import { ImportResult, FileUploadState } from './fileImport';

export interface StandardImportOptions {
  file: File;
  forceImport: boolean;
}

export interface BulkImportOptions extends StandardImportOptions {
  isLastChunk?: boolean;
  syncId?: string;
}

export interface ImportProgress {
  totalProcessed: number;
  totalInserted: number;
  totalSkipped: number;
  totalInvalid: number;
  totalIncoming: number;
  totalOutgoing: number;
  invalidRecords: Array<{ record: any; reason: string }>;
  syncId: string;
  unmatchedPhones?: string[];
}
