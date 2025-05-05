
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface DealFormProps {
  onComplete: () => void;
  existingDeal?: any;
}

export function DealForm({ onComplete, existingDeal }: DealFormProps) {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    toast({
      title: "Info",
      description: "Please connect Supabase to enable saving deals.",
    });
    
    onComplete();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Deal Name</Label>
        <Input 
          id="name" 
          name="name" 
          placeholder="Enterprise License Agreement"
          defaultValue={existingDeal?.name}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Select defaultValue={existingDeal?.company || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="acme">Acme Inc</SelectItem>
            <SelectItem value="techinnovate">Tech Innovate</SelectItem>
            <SelectItem value="globalfinance">Global Finance</SelectItem>
            <SelectItem value="xyztech">XYZ Tech</SelectItem>
            <SelectItem value="newstartup">New Startup</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Deal Value</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              $
            </span>
            <Input 
              id="value" 
              name="value" 
              type="number" 
              placeholder="10000"
              defaultValue={existingDeal?.value}
              className="pl-7"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stage">Deal Stage</Label>
          <Select defaultValue={existingDeal?.stage || "lead"}>
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed-won">Closed Won</SelectItem>
              <SelectItem value="closed-lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
          <Input 
            id="expectedCloseDate" 
            name="expectedCloseDate" 
            type="date" 
            defaultValue={existingDeal?.expectedCloseDate}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="probability">Probability (%)</Label>
          <Input 
            id="probability" 
            name="probability" 
            type="number" 
            placeholder="50"
            min="0"
            max="100"
            defaultValue={existingDeal?.probability}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="owner">Deal Owner</Label>
        <Select defaultValue={existingDeal?.owner || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="john">John Doe</SelectItem>
            <SelectItem value="sarah">Sarah Johnson</SelectItem>
            <SelectItem value="mike">Mike Williams</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Add details about this deal..."
          defaultValue={existingDeal?.description}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit">
          {existingDeal ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
}
