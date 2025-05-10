
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface InviteTeamMemberProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvitationSent?: () => void;
}

export function InviteTeamMember({ open, onOpenChange }: InviteTeamMemberProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature Temporarily Unavailable</AlertTitle>
          <AlertDescription>
            Team invitation functionality has been temporarily disabled for maintenance. 
            It will be enabled again in a future update.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
