
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { NoteCard } from "./NoteCard";

interface EntityNote {
  entityId: string;
  entityName: string;
  entityType: 'company' | 'contact';
  content: string;
  isValid?: boolean;
}

interface ReviewStepProps {
  transcript: string;
  audioDuration: number;
  parsedNotes: EntityNote[];
  onNoteContentChange: (index: number, content: string) => void;
}

export function ReviewStep({ 
  transcript, 
  audioDuration, 
  parsedNotes, 
  onNoteContentChange 
}: ReviewStepProps) {
  return (
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
            <NoteCard 
              key={index} 
              note={note} 
              index={index} 
              onNoteContentChange={onNoteContentChange} 
            />
          ))
        )}
      </div>
    </div>
  );
}
