
export interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: 'active' | 'pending';
  avatar_url?: string | null;
  job_title?: string | null;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  organization_id: string;
  invited_by: string | null;
  created_at: string;
  last_sent_at: string | null;
  expires_at: string;
  status: 'pending' | 'sent' | 'accepted' | 'expired' | 'canceled';
  accepted_at: string | null;
  personal_message: string | null;
}
