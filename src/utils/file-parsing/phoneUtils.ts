// Normalize phone number to E.164-like format (remove non-numeric chars except leading +)
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Keep the leading + if it exists
  const hasPlus = phone.startsWith('+');
  
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  
  // Add back the + if it was there
  return hasPlus ? `+${digits}` : digits;
}

// Extract phone number from chat session string if present
export function extractPhoneNumber(chatSession: string): string | null {
  if (!chatSession) return null;
  
  // Look for patterns that might be phone numbers in the chat session
  const phonePattern = /(?:\+|(?:\+\d{1,3}))?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const matches = chatSession.match(phonePattern);
  
  if (matches && matches.length > 0) {
    return normalizePhoneNumber(matches[0]);
  }
  
  return null;
}
