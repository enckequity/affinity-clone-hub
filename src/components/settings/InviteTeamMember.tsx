import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { TeamInvitation } from '@/types/teamTypes';

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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: 'member',
      message: '',
    }
  });
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // First get the organization ID for the current user using an explicit type
      // This avoids deep type inference that can cause TS2589 error
      const orgResult = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (orgResult.error) throw orgResult.error;
      
      const organizationId = orgResult.data.organization_id;
      
      // Check if the user is already a member of the organization
      const existingMemberResult = await supabase
        .from('profiles')
        .select('id')
        .eq('email', values.email)
        .maybeSingle();

      if (existingMemberResult.data) {
        const alreadyMemberResult = await supabase
          .from('organization_members')
          .select()
          .eq('organization_id', organizationId)
          .eq('user_id', existingMemberResult.data.id)
          .maybeSingle();

        if (alreadyMemberResult.data) {
          toast({
            title: "User is already a member",
            description: "This user is already a member of your organization.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Check if there's already a pending invitation for this email
      const inviteCheckResult = await supabase.functions.invoke<any>('check-team-invitation', {
        body: { 
          email: values.email,
          organizationId
        }
      });
      
      if (inviteCheckResult.error) {
        console.error("Error checking invitation:", inviteCheckResult.error);
        throw inviteCheckResult.error;
      } 
      
      const existingInvites = inviteCheckResult.data;
      
      if (existingInvites && existingInvites.length > 0) {
        toast({
          title: "Invitation already sent",
          description: "There is already a pending invitation for this email address.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create the invitation via edge function
      const invitationResult = await supabase.functions.invoke<{id: string}>('create-team-invitation', {
        body: { 
          email: values.email,
          role: values.role,
          organizationId,
          invitedBy: user.id,
          personalMessage: values.message || null
        }
      });
      
      if (invitationResult.error) throw invitationResult.error;

      // Send the invitation email via edge function
      const emailResult = await supabase.functions.invoke('send-team-invitation', {
        body: { 
          invitationId: invitationResult.data.id,
          email: values.email,
          role: values.role,
          message: values.message 
        }
      });
      
      if (emailResult.error) throw emailResult.error;
      
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="colleague@example.com" 
                      type="email"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="member">Team Member</SelectItem>
                        <SelectItem value="readonly">Read-only</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.value === 'admin' && 'Full access to all features and settings'}
                    {field.value === 'manager' && 'Can manage deals, contacts, and activities, but limited settings access'}
                    {field.value === 'member' && 'Can create and update deals, contacts, and activities'}
                    {field.value === 'readonly' && 'Can only view information, no editing capabilities'}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a personal message to your invitation..." 
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
