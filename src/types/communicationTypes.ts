
// Define response types for type casting
export type SingleRowResponse<T> = { data: T | null; error: Error | null };
export type MultiRowResponse<T> = { data: T[] | null; error: Error | null };

// Define an interface for errors that might include a code property
export interface CodedError extends Error {
  code?: string;
}

// Communication type interfaces
export interface Communication {
  id: string;
  type: string;
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  content?: string;
  duration?: number;
  contact_id: string;
  important: boolean;
  read: boolean;
  user_id: string;
  contact_name?: string;
  contact_phone?: string;
}

export interface ContactMapping {
  id: string;
  phone_number: string;
  contact_id: string;
  contacts?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface SyncLog {
  id: string;
  start_time: string;
  end_time?: string;
  status: 'completed' | 'in_progress' | 'failed';
  sync_type: string;
  records_synced?: number;
  user_id: string;
}
