
import { supabase } from '@/integrations/supabase/client';
import { InviteCheckResponse, InvitationResponse } from '@/types/invitationTypes';

/**
 * Check if an invitation already exists for the given email and organization
 */
export async function checkExistingInvite(
  email: string,
  organizationId: string
): Promise<InviteCheckResponse[]> {
  const { data, error } = await supabase.functions.invoke('check-team-invitation', {
    body: { 
      email,
      organizationId
    }
  });
  
  if (error) throw error;
  return data as InviteCheckResponse[] || [];
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
  const { data, error } = await supabase.functions.invoke('create-team-invitation', {
    body: { 
      email,
      role,
      organizationId,
      invitedBy,
      personalMessage
    }
  });
  
  if (error) throw error;
  return data as InvitationResponse;
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
  const { error } = await supabase.functions.invoke('send-team-invitation', {
    body: { 
      invitationId,
      email,
      role,
      message 
    }
  });
  
  if (error) throw error;
}

/**
 * Get organization ID for user
 */
export async function getUserOrganizationId(userId: string): Promise<string> {
  const result = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (result.error) throw result.error;
  if (!result.data) throw new Error('No organization found');
  
  return result.data.organization_id;
}

/**
 * Check if a user is already a member of an organization
 */
export async function checkIfUserIsMember(email: string, organizationId: string): Promise<boolean> {
  // Get user ID from email
  const userResult = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (userResult.error) throw userResult.error;
  if (!userResult.data) return false; // User doesn't exist
  
  // Check if user is already a member
  const memberResult = await supabase
    .from('organization_members')
    .select()
    .eq('organization_id', organizationId)
    .eq('user_id', userResult.data.id)
    .maybeSingle();

  if (memberResult.error) throw memberResult.error;
  
  return !!memberResult.data;
}
