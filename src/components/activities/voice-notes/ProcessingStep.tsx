
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface ProcessingStepProps {
  error: string | null;
  transcript: string;
  parsingRetries: number;
  onRetry: () => void;
  onStartOver: () => void;
}

export function ProcessingStep({ 
  error, 
  transcript, 
  parsingRetries, 
  onRetry, 
  onStartOver 
}: ProcessingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      {error ? (
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
          <p>Processing encountered an error</p>
          
          {parsingRetries < 2 && transcript && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Retry Parsing
            </Button>
          )}
        </div>
      ) : (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center">Processing your recording and extracting customer notes...</p>
          <p className="text-sm text-muted-foreground">This may take a minute. Please don't close this window.</p>
        </>
      )}
    </div>
  );
}
