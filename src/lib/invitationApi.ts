
import { supabase } from '@/integrations/supabase/client';
import { InviteCheckResponse, InvitationResponse } from '@/types/invitationTypes';

// Define response types for type casting
type SingleRowResponse<T> = { data: T | null; error: Error | null };
type MultiRowResponse<T> = { data: T[] | null; error: Error | null };

/**
 * Check if an invitation already exists for the given email and organization
 */
export async function checkExistingInvite(
  email: string,
  organizationId: string
): Promise<InviteCheckResponse[]> {
  // This function is now simplified for single-user mode
  return [];
}

/**
 * Create a new invitation
 */
export async function createInvitation(
  email: string,
  role: string,
  organizationId: string,
  invitedBy: string,
  personalMessage: string | null
): Promise<InvitationResponse> {
  // This function is now simplified for single-user mode
  throw new Error('Team functionality is temporarily disabled');
}

/**
 * Send an invitation email
 */
export async function sendInvitationEmail(
  invitationId: string,
  email: string,
  role: string,
  message?: string
): Promise<void> {
  // This function is now simplified for single-user mode
  throw new Error('Team functionality is temporarily disabled');
}

/**
 * Get user ID from profile
 */
export async function getUserProfile(email: string): Promise<string | null> {
  const result = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle() as unknown as SingleRowResponse<{ id: string }>;

  if (result.error) throw result.error;
  return result.data?.id || null;
}
