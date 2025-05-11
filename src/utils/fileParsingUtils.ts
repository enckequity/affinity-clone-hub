
// This file now serves as a barrel export for all file parsing utilities
import { detectFileFormat } from './file-parsing/fileFormatDetection';
import { normalizePhoneNumber, extractPhoneNumber } from './file-parsing/phoneUtils';
import { parseCSV } from './file-parsing/csvParser';
import { standardizeCommunication } from './file-parsing/recordNormalization';
import { parseCSVInChunks, processCSVInChunks } from './file-parsing/chunkProcessing';
import { parseFileContent } from './file-parsing/fileContent';
import { FileFormat } from './types/fileFormats';

export {
  detectFileFormat,
  normalizePhoneNumber,
  extractPhoneNumber,
  parseCSV,
  standardizeCommunication,
  parseCSVInChunks,
  processCSVInChunks,
  parseFileContent
};

export type { FileFormat };
