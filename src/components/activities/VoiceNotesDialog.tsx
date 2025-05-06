
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder } from "../ui/audio-recorder";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EntityNote {
  entityId: string;
  entityName: string;
  entityType: 'company' | 'contact';
  content: string;
  isValid?: boolean;
}

interface VoiceNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceNotesDialog({ open, onOpenChange }: VoiceNotesDialogProps) {
  const [step, setStep] = useState<'record' | 'processing' | 'review' | 'saving'>('record');
  const [transcript, setTranscript] = useState<string>('');
  const [parsedNotes, setParsedNotes] = useState<EntityNote[]>([]);
  const [audioBase64, setAudioBase64] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [voiceRecordingId, setVoiceRecordingId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch companies and contacts when dialog opens
  useEffect(() => {
    if (open) {
      fetchEntities();
      setError(null);
    } else {
      // Reset state when dialog closes
      resetState();
    }
  }, [open]);
  
  const resetState = () => {
    setStep('record');
    setTranscript('');
    setParsedNotes([]);
    setAudioBase64('');
    setAudioDuration(0);
    setVoiceRecordingId(null);
    setError(null);
  };
  
  const fetchEntities = async () => {
    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');
        
      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);
      
      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name');
        
      if (contactsError) throw contactsError;
      setContacts(contactsData || []);
      
    } catch (error: any) {
      console.error('Error fetching entities:', error);
      setError('Could not fetch companies and contacts. Please try again.');
      toast({
        title: "Error fetching data",
        description: error.message || "Could not fetch companies and contacts",
        variant: "destructive",
      });
    }
  };
  
  const handleRecordingComplete = async (base64Audio: string, duration: number) => {
    setError(null);
    setAudioBase64(base64Audio);
    setAudioDuration(duration);
    setStep('processing');
    
    try {
      if (!user) {
        throw new Error("You must be logged in to record voice notes");
      }
      
      console.log("Audio received, length:", base64Audio.length);
      
      if (!base64Audio || base64Audio.length < 100) {
        throw new Error("Audio recording too short or empty");
      }

      // First, save the recording
      const { data: recordingData, error: recordingError } = await supabase
        .from('voice_recordings')
        .insert({
          duration: duration,
          user_id: user.id
        })
        .select()
        .single();
        
      if (recordingError) {
        console.error("Error saving recording:", recordingError);
        throw recordingError;
      }
      
      setVoiceRecordingId(recordingData.id);
      console.log("Voice recording saved with ID:", recordingData.id);
      
      // Process the audio with voice-to-text function
      console.log("Sending audio to voice-to-text function");
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions
        .invoke('voice-to-text', {
          body: { audio: base64Audio }
        });
        
      if (transcriptionError) {
        console.error("Transcription error:", transcriptionError);
        throw new Error(`Transcription failed: ${transcriptionError.message || 'Unknown error'}`);
      }
      
      if (!transcriptionData || !transcriptionData.text) {
        console.error("No transcription returned", transcriptionData);
        throw new Error('No transcription returned. Please try again with a clearer recording.');
      }
      
      console.log("Transcription received:", transcriptionData.text);
      
      // Update the transcript
      setTranscript(transcriptionData.text);
      
      // Parse the transcript into separate notes
      console.log("Sending transcript to parse-notes function");
      const { data: parseData, error: parseError } = await supabase.functions
        .invoke('parse-notes', {
          body: { 
            transcript: transcriptionData.text,
            entities: {
              companies: companies,
              contacts: contacts
            }
          }
        });
        
      if (parseError) {
        console.error("Parsing error:", parseError);
        throw new Error(`Note parsing failed: ${parseError.message || 'Unknown error'}`);
      }
      
      if (!parseData || !parseData.notes) {
        console.error("No parsed notes returned", parseData);
        throw new Error('No notes could be extracted from your recording. Try mentioning company or contact names explicitly.');
      }
      
      console.log("Notes parsed successfully:", parseData.notes);
      
      // Update the parsed notes
      setParsedNotes(parseData.notes || []);
      
      // Update voice recording with transcript
      await supabase
        .from('voice_recordings')
        .update({
          transcript: transcriptionData.text,
          status: 'completed'
        })
        .eq('id', recordingData.id);
      
      setStep('review');
      
    } catch (error: any) {
      console.error('Error processing voice recording:', error);
      setError(error.message || "Failed to process the voice recording");
      setStep('record');
      toast({
        title: "Error processing recording",
        description: error.message || "Failed to process the voice recording",
        variant: "destructive",
      });
    }
  };
  
  const handleNoteContentChange = (index: number, content: string) => {
    const updatedNotes = [...parsedNotes];
    updatedNotes[index] = { ...updatedNotes[index], content };
    setParsedNotes(updatedNotes);
  };
  
  const handleSaveNotes = async () => {
    setError(null);
    setStep('saving');
    
    try {
      if (!user) {
        throw new Error("You must be logged in to save notes");
      }

      const notesToSave = parsedNotes.filter(note => note.content.trim() !== '');
      
      if (notesToSave.length === 0) {
        throw new Error('No valid notes to save');
      }
      
      // Prepare notes for insertion
      const notesForDb = notesToSave.map(note => ({
        content: note.content,
        entity_id: note.entityId,
        entity_type: note.entityType,
        voice_recording_id: voiceRecordingId,
        user_id: user.id
      }));
      
      // Insert notes into database
      const { error: notesError } = await supabase
        .from('notes')
        .insert(notesForDb);
        
      if (notesError) throw notesError;
      
      toast({
        title: "Notes saved successfully",
        description: `${notesToSave.length} notes have been created.`,
      });
      
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error saving notes:', error);
      setError(error.message || "Failed to save notes");
      setStep('review');
      toast({
        title: "Error saving notes",
        description: error.message || "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Voice Notes</DialogTitle>
          <DialogDescription>
            {step === 'record' && "Record your voice notes about multiple customers in one go."}
            {step === 'processing' && "Processing your voice recording..."}
            {step === 'review' && "Review the extracted notes before saving."}
            {step === 'saving' && "Saving your notes..."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {step === 'record' && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-md space-y-2">
                <h3 className="font-medium text-sm">How to use this feature:</h3>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Record yourself speaking clearly about multiple customers</li>
                  <li>Mention company or contact names explicitly: "For Acme Inc, the latest project..."</li>
                  <li>Use clear transitions: "Moving on to Global Finance..."</li>
                  <li>Speak in complete sentences for better transcription</li>
                  <li>Ensure you're in a quiet environment with minimal background noise</li>
                </ul>
              </div>
              
              <div className="flex justify-center py-6">
                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
              </div>
            </div>
          )}
          
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center">Processing your recording and extracting customer notes...</p>
              <p className="text-sm text-muted-foreground">This may take a minute. Please don't close this window.</p>
            </div>
          )}
          
          {step === 'review' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Full Transcript</h3>
                  <Badge variant="outline" className="font-normal">
                    {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
                  </Badge>
                </div>
                <Textarea 
                  value={transcript} 
                  readOnly 
                  className="h-24 bg-muted/30 resize-none"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">
                  Extracted Notes ({parsedNotes.length})
                </h3>
                
                {parsedNotes.length === 0 ? (
                  <div className="bg-muted p-4 rounded-md text-center">
                    <p>No customer references were detected in your recording.</p>
                    <p className="text-sm text-muted-foreground mt-1">Try recording again and mention customer names clearly.</p>
                  </div>
                ) : (
                  parsedNotes.map((note, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{note.entityName}</h4>
                          <p className="text-xs text-muted-foreground">
                            {note.entityType === 'company' ? 'Company' : 'Contact'}
                          </p>
                        </div>
                        {note.isValid === false ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <Textarea
                        value={note.content}
                        onChange={(e) => handleNoteContentChange(index, e.target.value)}
                        placeholder="Note content"
                        className="min-h-[80px]"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {step === 'saving' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center">Saving notes to customer records...</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {step === 'record' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          )}
          
          {step === 'processing' && (
            <Button variant="outline" disabled>
              Processing...
            </Button>
          )}
          
          {step === 'review' && (
            <>
              <Button variant="outline" onClick={() => setStep('record')}>
                Record Again
              </Button>
              <Button 
                onClick={handleSaveNotes} 
                disabled={parsedNotes.length === 0}
              >
                Save All Notes
              </Button>
            </>
          )}
          
          {step === 'saving' && (
            <Button disabled>
              Saving...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
