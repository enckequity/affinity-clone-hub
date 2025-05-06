
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string | null;
  detailedError: string | null;
  step: 'record' | 'processing' | 'review' | 'saving';
  parsingRetries: number;
  onRetry: () => void;
}

export function ErrorDisplay({ 
  error, 
  detailedError, 
  step, 
  parsingRetries,
  onRetry 
}: ErrorDisplayProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
      
      {/* Show retry button for parsing errors */}
      {step === 'processing' && parsingRetries < 2 && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Retry
        </Button>
      )}
      
      {/* Show detailed error if available */}
      {detailedError && (
        <div className="mt-2 text-xs opacity-80 bg-destructive/10 p-2 rounded">
          <details>
            <summary>Technical details</summary>
            <pre className="whitespace-pre-wrap">{detailedError}</pre>
          </details>
        </div>
      )}
    </Alert>
  );
}
