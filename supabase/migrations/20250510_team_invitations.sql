
-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  personal_message TEXT,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'accepted', 'expired', 'canceled'))
);

-- Add Row Level Security policy
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for team_invitations
CREATE POLICY "Organization admins can view their invitations" 
ON public.team_invitations
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = team_invitations.organization_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins can create invitations" 
ON public.team_invitations
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = NEW.organization_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Organization admins can update invitations" 
ON public.team_invitations
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = team_invitations.organization_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Organization admins can delete invitations" 
ON public.team_invitations
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = team_invitations.organization_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_organization ON public.team_invitations(organization_id);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);

-- Create a function to expire invitations automatically
CREATE OR REPLACE FUNCTION expire_team_invitations()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.team_invitations 
  SET status = 'expired'
  WHERE expires_at < now() AND status IN ('pending', 'sent');
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the expiration function
CREATE TRIGGER check_expired_invitations
AFTER INSERT OR UPDATE ON public.team_invitations
EXECUTE FUNCTION expire_team_invitations();
