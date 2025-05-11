
import { FileFormat } from "../types/fileFormats";

// Function to detect file format based on headers
export const detectFileFormat = (headers: string[]): FileFormat => {
  // Check for UTF-8 BOM and strip if present
  headers = headers.map(h => h.replace(/^\uFEFF/, ''));
  
  // Normalize headers for case-insensitive comparison
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Improved detection for iMessage format
  const isIMessageFormat = (
    (normalizedHeaders.includes('chat session')) ||
    ((normalizedHeaders.includes('sender id') || normalizedHeaders.includes('senderid')) && 
     (normalizedHeaders.includes('message date') || normalizedHeaders.includes('date')) &&
     (normalizedHeaders.includes('text') || normalizedHeaders.includes('message')) &&
     (normalizedHeaders.includes('type') || normalizedHeaders.includes('service')))
  );
  
  // Detect standard format
  const isStandardFormat = normalizedHeaders.includes('phone') && 
                          (normalizedHeaders.includes('timestamp') || normalizedHeaders.includes('date')) &&
                          (normalizedHeaders.includes('text') || normalizedHeaders.includes('message') || normalizedHeaders.includes('content'));
  
  if (isIMessageFormat) {
    return 'imazing';
  }
  
  if (isStandardFormat) {
    return 'standard';
  }
  
  return 'unknown';
};
