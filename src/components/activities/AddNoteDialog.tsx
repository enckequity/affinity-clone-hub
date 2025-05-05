
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId?: string;
  entityType?: 'contact' | 'company' | 'deal';
}

export function AddNoteDialog({ 
  open, 
  onOpenChange,
  entityId,
  entityType 
}: AddNoteDialogProps) {
  const [content, setContent] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally save the note to the database
    console.log('Adding note:', {
      content,
      entityId,
      entityType
    });
    
    toast({
      title: "Note added",
      description: "The note has been successfully added.",
    });
    
    // Reset form
    setContent('');
    
    // Close dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="content">Note</Label>
            <Textarea 
              id="content" 
              placeholder="Enter your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Note</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
