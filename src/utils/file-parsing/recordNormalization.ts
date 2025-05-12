
import { CommunicationRecord } from "@/types/fileImport";
import { FileFormat } from "../types/fileFormats";

// Convert CSV record to our standardized communication format
export const standardizeCommunication = (record: Record<string, string>, fileFormat: FileFormat, forceImport: boolean = false): CommunicationRecord => {
  if (fileFormat === 'imazing' || forceImport) {
    // Mapping fields for iMessage format with fallbacks
    const chatSessionField = Object.keys(record).find(k => 
      ['chat session'].includes(k.toLowerCase())
    ) || '';
    
    const senderIdField = Object.keys(record).find(k => 
      ['sender id', 'senderid', 'sender', 'from'].includes(k.toLowerCase())
    ) || '';
    
    const typeField = Object.keys(record).find(k => 
      ['type', 'message type', 'messagetype'].includes(k.toLowerCase())
    ) || '';
    
    const senderNameField = Object.keys(record).find(k => 
      ['sender name', 'sendername', 'from name'].includes(k.toLowerCase())
    ) || '';
    
    const messageDateField = Object.keys(record).find(k => 
      ['message date', 'messagedate', 'date', 'time'].includes(k.toLowerCase())
    ) || '';
    
    const textField = Object.keys(record).find(k => 
      ['text', 'message', 'content', 'body'].includes(k.toLowerCase())
    ) || '';
    
    const serviceField = Object.keys(record).find(k => 
      ['service', 'platform'].includes(k.toLowerCase())
    ) || '';
    
    // Determine direction based on type field directly
    // Default to 'outgoing' instead of 'unknown'
    let direction: 'incoming' | 'outgoing' | 'missed' = 'outgoing';
    
    if (typeField && record[typeField]) {
      const typeValue = record[typeField].toLowerCase();
      if (typeValue.includes('incoming')) {
        direction = 'incoming';
      } else if (typeValue.includes('outgoing')) {
        direction = 'outgoing';
      } else if (typeValue.includes('missed')) {
        direction = 'missed';
      }
    }
    
    // If direction is still outgoing (was unknown before), try using service field
    if (direction === 'outgoing' && serviceField && record[serviceField]) {
      // For iMessage format, try to determine from sender ID field
      if (senderIdField && record[senderIdField]) {
        direction = 'incoming';  // If sender ID is present, it's usually incoming
      }
    }
    
    // Get contact info
    let phoneNumber = '';
    let contactName = '';
    
    // Use sender ID for phone number if present
    if (senderIdField && record[senderIdField]) {
      phoneNumber = record[senderIdField];
      
      // Clean up phone number (remove non-numeric characters if it looks like a phone number)
      if (phoneNumber.includes('+') || /\d{10,}/.test(phoneNumber)) {
        phoneNumber = phoneNumber.replace(/\D/g, '');
        if (phoneNumber.length > 0) {
          // Add + back if it was there
          if (record[senderIdField].startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
          }
        }
      }
    }
    
    // Use chat session as a fallback for contact information
    if ((!phoneNumber || phoneNumber === 'unknown') && chatSessionField && record[chatSessionField]) {
      contactName = record[chatSessionField];
      // If chat session has a phone-like format, use it as phone number
      if (/\+?\d{10,}/.test(record[chatSessionField])) {
        phoneNumber = record[chatSessionField];
      }
    }
    
    // Use sender name if available
    if (senderNameField && record[senderNameField]) {
      contactName = record[senderNameField];
    }
    
    // Try to parse iMessage date format
    let timestamp = record[messageDateField] || new Date().toISOString();
    if (timestamp && !timestamp.includes('T')) {
      // iMessage export typically has a format like "2023-10-15 14:30:25"
      try {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          timestamp = date.toISOString();
        }
      } catch (e) {
        console.warn("Could not parse timestamp:", timestamp);
        timestamp = new Date().toISOString();
      }
    }
    
    // Get message content, truncate if necessary (>65KB)
    const content = (record[textField] || '').substring(0, 65000);
    
    return {
      contact_phone: phoneNumber || 'unknown',
      contact_name: contactName || '',
      direction: direction,
      type: 'text', // Assuming all are text messages
      content: content,
      timestamp: timestamp,
      chat_session: record[chatSessionField] || '' // Add chat_session for unique constraining
    };
  } else {
    // Standard format mapping
    const phoneField = Object.keys(record).find(k => 
      ['phone', 'phone_number', 'contact', 'contact_phone', 'number'].includes(k.toLowerCase())
    ) || '';
    
    const timestampField = Object.keys(record).find(k => 
      ['timestamp', 'date', 'time', 'datetime'].includes(k.toLowerCase())
    ) || '';
    
    const contentField = Object.keys(record).find(k => 
      ['content', 'text', 'message', 'body', 'msg'].includes(k.toLowerCase())
    ) || '';
    
    const directionField = Object.keys(record).find(k => 
      ['direction', 'type', 'messagetype', 'message_type'].includes(k.toLowerCase())
    ) || '';
    
    const nameField = Object.keys(record).find(k => 
      ['name', 'contact_name', 'sender', 'recipient'].includes(k.toLowerCase())
    ) || '';
    
    // Determine direction based on available fields
    // Default to 'outgoing' instead of 'unknown'
    let direction: 'incoming' | 'outgoing' | 'missed' = 'outgoing';
    
    if (directionField && record[directionField]) {
      const dirValue = record[directionField].toLowerCase();
      if (dirValue.includes('in') || dirValue.includes('received')) {
        direction = 'incoming';
      } else if (dirValue.includes('out') || dirValue.includes('sent')) {
        direction = 'outgoing';
      } else if (dirValue.includes('missed')) {
        direction = 'missed';
      }
    }
    
    // Try to parse timestamp
    let timestamp = record[timestampField] || new Date().toISOString();
    if (timestamp && !timestamp.includes('T')) {
      // Try to parse various date formats
      try {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          timestamp = date.toISOString();
        }
      } catch (e) {
        console.warn("Could not parse timestamp:", timestamp);
        timestamp = new Date().toISOString();
      }
    }

    // Get message content, truncate if necessary (>65KB)
    const content = (record[contentField] || '').substring(0, 65000);

    return {
      contact_phone: record[phoneField] || 'unknown',
      contact_name: record[nameField] || '',
      direction: direction,
      type: 'text', // Assuming all are text messages
      content: content,
      timestamp: timestamp,
      chat_session: '' // Empty for standard format
    };
  }
};
