
// Types related to team invitations
export interface InviteFormValues {
  email: string;
  role: string;
  message: string;
}

// Helper types for Supabase responses
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

export interface InviteCheckResponse {
  id: string;
  email: string;
  status: string;
  [key: string]: any;
}

export interface InvitationResponse {
  id: string;
  [key: string]: any;
}
