
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";

interface EntityNote {
  entityId: string;
  entityName: string;
  entityType: 'company' | 'contact';
  content: string;
  isValid?: boolean;
}

interface NoteCardProps {
  note: EntityNote;
  index: number;
  onNoteContentChange: (index: number, content: string) => void;
}

export function NoteCard({ note, index, onNoteContentChange }: NoteCardProps) {
  return (
    <div className="border rounded-md p-4 space-y-3">
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
        onChange={(e) => onNoteContentChange(index, e.target.value)}
        placeholder="Note content"
        className="min-h-[80px]"
      />
    </div>
  );
}
