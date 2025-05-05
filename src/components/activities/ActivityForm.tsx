
import React, { useState } from 'react';
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
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActivityFormProps {
  onComplete: () => void;
  existingActivity?: any;
}

export function ActivityForm({ onComplete, existingActivity }: ActivityFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(existingActivity?.date ? new Date(existingActivity.date) : new Date());
  const [time, setTime] = useState(existingActivity?.time || '09:00');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    toast({
      title: "Info",
      description: "Please connect Supabase to enable saving activities.",
    });
    
    onComplete();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="Meeting with Client"
          defaultValue={existingActivity?.title}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Activity Type</Label>
        <Select defaultValue={existingActivity?.type || "meeting"}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="task">Task</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input 
            id="time" 
            name="time" 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="relatedTo">Related To</Label>
        <Select defaultValue={existingActivity?.relatedTo || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select related record" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="acme">Acme Inc (Company)</SelectItem>
            <SelectItem value="tech">Tech Innovate (Company)</SelectItem>
            <SelectItem value="global">Global Finance (Company)</SelectItem>
            <SelectItem value="john">John Smith (Contact)</SelectItem>
            <SelectItem value="sarah">Sarah Johnson (Contact)</SelectItem>
            <SelectItem value="license">Enterprise License (Deal)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contact">Contact</Label>
        <Select defaultValue={existingActivity?.contact || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="john">John Smith</SelectItem>
            <SelectItem value="sarah">Sarah Johnson</SelectItem>
            <SelectItem value="mike">Mike Brown</SelectItem>
            <SelectItem value="emily">Emily Davis</SelectItem>
            <SelectItem value="david">David Rodriguez</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Add details about this activity..."
          defaultValue={existingActivity?.description}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit">
          {existingActivity ? 'Update Activity' : 'Create Activity'}
        </Button>
      </div>
    </form>
  );
}
