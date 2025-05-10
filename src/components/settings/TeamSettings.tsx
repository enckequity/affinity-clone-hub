
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Mail, Check, X, AlertCircle } from "lucide-react";
import { InviteTeamMember } from '@/components/settings/InviteTeamMember';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: 'active' | 'pending';
  avatar_url?: string | null;
  job_title?: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  organization_id: string;
}

export function TeamSettings() {
  const [isInviting, setIsInviting] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Fetch team members (active users in the organization)
  const { data: teamMembers, isLoading: loadingMembers, error: membersError, refetch: refetchMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      if (!user) return [];

      const { data: organizationData, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (orgError || !organizationData) {
        console.error('Error fetching organization:', orgError);
        return [];
      }

      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          role,
          profiles!inner(
            id,
            email:auth.users!inner(email),
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationData.organization_id);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return data.map(member => ({
        id: member.user_id,
        email: member.profiles.email,
        first_name: member.profiles.first_name,
        last_name: member.profiles.last_name,
        avatar_url: member.profiles.avatar_url,
        role: member.role,
        status: 'active' as const
      }));
    },
    enabled: !!user
  });

  // Fetch pending invitations
  const { data: invitations, isLoading: loadingInvites, error: invitesError, refetch: refetchInvites } = useQuery({
    queryKey: ['team-invitations'],
    queryFn: async () => {
      if (!user) return [];

      const { data: organizationData, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (orgError || !organizationData) {
        console.error('Error fetching organization:', orgError);
        return [];
      }

      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('organization_id', organizationData.organization_id);

      if (error) {
        console.error('Error fetching team invitations:', error);
        return [];
      }

      return data;
    },
    enabled: !!user
  });

  const handleDelete = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);
      
      if (error) throw error;
      
      toast({
        title: "Invitation deleted",
        description: "The invitation has been removed",
      });
      
      refetchInvites();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  const handleResend = async (invitation: Invitation) => {
    try {
      // Call the edge function to resend the invitation email
      const { error } = await supabase.functions.invoke('send-team-invitation', {
        body: { 
          invitationId: invitation.id,
          email: invitation.email,
          role: invitation.role
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Invitation resent",
        description: `An invitation has been resent to ${invitation.email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const isAdmin = teamMembers?.find(member => member.id === user?.id)?.role === 'admin';

  // Combine active members and pending invitations
  const allTeamMembers = [
    ...(teamMembers || []),
    ...(invitations || []).map(invite => ({
      id: invite.id,
      email: invite.email,
      first_name: null,
      last_name: null,
      role: invite.role,
      status: 'pending' as const
    }))
  ];

  const onInvitationSent = () => {
    refetchInvites();
  };

  if (loadingMembers || loadingInvites) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Loading team data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (membersError || invitesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>There was an error loading team data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {membersError?.message || invitesError?.message || "Failed to load team data. Please try again."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your team and their permissions
            </CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsInviting(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTeamMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              allTeamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {member.first_name && member.last_name
                            ? `${member.first_name[0]}${member.last_name[0]}`
                            : member.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.email.split('@')[0]}
                        </p>
                        {member.job_title && (
                          <p className="text-xs text-muted-foreground">{member.job_title}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge>{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {member.status === 'active' ? (
                      <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && member.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleResend(member as unknown as Invitation)}
                          title="Resend invitation"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(member.id)}
                          title="Delete invitation"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {(member.status === 'active' && member.id !== user?.id) && (
                      <Button variant="ghost" size="sm">Manage</Button>
                    )}
                    {member.id === user?.id && (
                      <Badge variant="secondary" className="ml-2">You</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <InviteTeamMember 
          open={isInviting} 
          onOpenChange={setIsInviting} 
          onInvitationSent={onInvitationSent}
        />
      </CardContent>
    </Card>
  );
}
