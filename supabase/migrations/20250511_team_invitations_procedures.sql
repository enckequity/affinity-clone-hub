
-- Create a function to get team invitations by organization
CREATE OR REPLACE FUNCTION get_team_invitations(p_organization_id UUID)
RETURNS SETOF team_invitations
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM team_invitations
  WHERE organization_id = p_organization_id;
$$;

-- Create a function to get an invitation by email
CREATE OR REPLACE FUNCTION get_team_invitation_by_email(p_email TEXT, p_organization_id UUID)
RETURNS SETOF team_invitations
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM team_invitations
  WHERE email = p_email AND organization_id = p_organization_id AND status IN ('pending', 'sent');
$$;

-- Create a function to create a team invitation
CREATE OR REPLACE FUNCTION create_team_invitation(
  p_email TEXT,
  p_role TEXT,
  p_organization_id UUID,
  p_invited_by UUID,
  p_personal_message TEXT
)
RETURNS team_invitations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation team_invitations;
BEGIN
  INSERT INTO team_invitations (
    email, role, organization_id, invited_by, personal_message
  ) VALUES (
    p_email, p_role, p_organization_id, p_invited_by, p_personal_message
  )
  RETURNING * INTO v_invitation;
  
  RETURN v_invitation;
END;
$$;

-- Create a function to delete a team invitation
CREATE OR REPLACE FUNCTION delete_team_invitation(p_invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM team_invitations WHERE id = p_invitation_id;
  RETURN FOUND;
END;
$$;

-- Create a function to get organization members with their profile information
CREATE OR REPLACE FUNCTION get_organization_members(p_organization_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    om.user_id,
    u.email,
    p.first_name,
    p.last_name,
    p.avatar_url,
    om.role
  FROM organization_members om
  JOIN auth.users u ON om.user_id = u.id
  JOIN profiles p ON om.user_id = p.id
  WHERE om.organization_id = p_organization_id;
END;
$$;
