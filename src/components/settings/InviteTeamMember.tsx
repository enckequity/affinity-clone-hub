
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { InviteFormFields } from './InviteFormFields';
import { InviteFormValues, InviteCheckResponse } from '@/types/invitationTypes';
import {
  checkExistingInvite,
  createInvitation,
  sendInvitationEmail,
  getUserOrganizationId,
  checkIfUserIsMember
} from '@/lib/invitationApi';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string().min(1, { message: "Please select a role" }),
  message: z.string().optional(),
});

interface InviteTeamMemberProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvitationSent?: () => void;
}

export function InviteTeamMember({ open, onOpenChange, onInvitationSent }: InviteTeamMemberProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'member',
      message: '',
    }
  });
  
  const handleSubmit = async (values: InviteFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Get organization ID
      const organizationId = await getUserOrganizationId(user.id);
      
      // Check if user is already a member
      const isAlreadyMember = await checkIfUserIsMember(values.email, organizationId);
      if (isAlreadyMember) {
        toast({
          title: "User is already a member",
          description: "This user is already a member of your organization.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check if invitation already exists
      const existingInvites = await checkExistingInvite(values.email, organizationId);
      
      if (existingInvites && existingInvites.length > 0) {
        toast({
          title: "Invitation already sent",
          description: "There is already a pending invitation for this email address.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create invitation
      const invitationData = await createInvitation(
        values.email,
        values.role,
        organizationId,
        user.id,
        values.message || null
      );
      
      if (!invitationData || !invitationData.id) throw new Error('Failed to create invitation');

      // Send invitation email
      await sendInvitationEmail(
        invitationData.id,
        values.email,
        values.role,
        values.message
      );
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${values.email}.`,
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      if (onInvitationSent) {
        onInvitationSent();
      }
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <InviteFormFields 
              control={form.control}
              isSubmitting={isSubmitting}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
