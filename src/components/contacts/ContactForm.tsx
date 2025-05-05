
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ContactFormProps {
  onComplete: () => void;
  existingContact?: any;
}

export function ContactForm({ onComplete, existingContact }: ContactFormProps) {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    toast({
      title: "Info",
      description: "Please connect Supabase to enable saving contacts.",
    });
    
    onComplete();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName" 
            name="firstName" 
            placeholder="John"
            defaultValue={existingContact?.firstName}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName" 
            name="lastName" 
            placeholder="Smith"
            defaultValue={existingContact?.lastName}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="john.smith@example.com"
          defaultValue={existingContact?.email}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input 
          id="phone" 
          name="phone" 
          placeholder="+1 (555) 123-4567"
          defaultValue={existingContact?.phone}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input 
          id="company" 
          name="company" 
          placeholder="Acme Inc"
          defaultValue={existingContact?.company}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="CEO"
          defaultValue={existingContact?.title}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input 
          id="tags"
          name="tags" 
          placeholder="Customer, Decision Maker"
          defaultValue={existingContact?.tags?.join(', ')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          placeholder="Add any relevant notes about this contact..."
          defaultValue={existingContact?.notes}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit">
          {existingContact ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
}
