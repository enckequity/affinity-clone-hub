
import React from 'react';
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "@/components/ui/audio-recorder";

interface RecordingStepProps {
  onRecordingComplete: (base64Audio: string, duration: number) => void;
}

export function RecordingStep({ onRecordingComplete }: RecordingStepProps) {
  return (
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
        <AudioRecorder onRecordingComplete={onRecordingComplete} />
      </div>
    </div>
  );
}
