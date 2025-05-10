
import { supabase } from '@/integrations/supabase/client';
import { InviteCheckResponse, InvitationResponse } from '@/types/invitationTypes';

/**
 * IMPORTANT: Team functionality is temporarily disabled
 * The functions in this file are simplified stubs to avoid TypeScript errors
 * Actual team invitation functionality will be implemented in a future update
 */

/**
 * Check if an invitation already exists for the given email and organization
 */
export async function checkExistingInvite(
  email: string,
  organizationId: string
): Promise<InviteCheckResponse[]> {
  // Stub function - team functionality disabled
  console.log('Team invitations disabled - checkExistingInvite called with:', { email, organizationId });
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
  // Stub function - team functionality disabled
  console.log('Team invitations disabled - createInvitation called with:', { email, role, organizationId, invitedBy });
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
  // Stub function - team functionality disabled
  console.log('Team invitations disabled - sendInvitationEmail called with:', { invitationId, email, role, message });
  throw new Error('Team functionality is temporarily disabled');
}

/**
 * Get user ID from profile
 * Stub implementation since team functionality is disabled
 */
export async function getUserProfile(email: string): Promise<string | null> {
  // Complete stub implementation without Supabase usage to avoid type inference issues
  console.log('Team invitations disabled - getUserProfile called with:', { email });
  return null;
}
