
// Types related to team invitations
export interface InviteFormValues {
  email: string;
  role: string;
  message: string;
}

// Updated, flattened types for Supabase responses
export interface OrgMemberResult {
  data: { organization_id: string } | null;
  error: Error | null;
}

export interface ProfileResult {
  data: { id: string } | null;
  error: Error | null;
}

export interface OrgMemberCheckResult {
  data: Record<string, any> | null;
  error: Error | null;
}

// Flat interface for invitation response - used for consistent typing
export interface InviteCheckResponse {
  id: string;
  email: string;
  status: string;
  organization_id: string;
  role: string;
  created_at: string;
  [key: string]: any;
}

export interface InvitationResponse {
  id: string;
  email: string;
  role: string;
  organization_id: string;
  invited_by: string | null;
  status: string;
  created_at: string;
  [key: string]: any;
}
