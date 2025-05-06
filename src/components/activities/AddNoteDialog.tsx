
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioRecorder } from "../ui/audio-recorder";
import { Loader2, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [activeTab, setActiveTab] = useState<string>("text");
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Note is empty",
        description: "Please enter some content for your note.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Save note to Supabase
      const { error } = await supabase
        .from('notes')
        .insert({
          content,
          entity_id: entityId,
          entity_type: entityType,
        });
      
      if (error) throw error;
      
      toast({
        title: "Note added",
        description: "The note has been successfully added.",
      });
      
      // Reset form
      setContent('');
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Error saving note:", error);
      toast({
        title: "Error adding note",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleRecordingComplete = async (base64Audio: string, duration: number) => {
    setIsProcessingAudio(true);
    
    try {
      // Process the audio with voice-to-text function
      const { data, error } = await supabase.functions
        .invoke('voice-to-text', {
          body: { audio: base64Audio }
        });
        
      if (error) throw error;
      
      // Add the transcription to the note content
      setContent(data.text);
      setActiveTab("text");
      
    } catch (error: any) {
      console.error('Error processing voice recording:', error);
      toast({
        title: "Error processing recording",
        description: error.message || "Failed to process the voice recording",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAudio(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        
        <Tabs 
          defaultValue="text" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="text">Type Note</TabsTrigger>
            <TabsTrigger value="voice" disabled={isProcessingAudio}>Voice Note</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <TabsContent value="text" className="space-y-4 mt-0">
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
            </TabsContent>
            
            <TabsContent value="voice" className="space-y-4 mt-0">
              <div className="space-y-4">
                <Label>Record Voice Note</Label>
                {isProcessingAudio ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-center text-sm text-muted-foreground">Converting speech to text...</p>
                  </div>
                ) : (
                  <div className="flex justify-center py-6">
                    <AudioRecorder 
                      onRecordingComplete={handleRecordingComplete} 
                      isProcessing={isProcessingAudio}
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Record your note and we'll convert it to text automatically.
                </p>
              </div>
            </TabsContent>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessingAudio || !content.trim()}
              >
                Add Note
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
