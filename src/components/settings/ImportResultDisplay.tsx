
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { ImportResult } from "@/types/fileImport";

interface ImportResultDisplayProps {
  result: ImportResult;
  onReset: () => void;
}

export function ImportResultDisplay({ result, onReset }: ImportResultDisplayProps) {
  return (
    <div className="space-y-4">
      <Alert variant="default" className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Import Successful</AlertTitle>
        <AlertDescription>
          <div className="pt-2 space-y-1">
            <p>Total records processed: <span className="font-medium">{result.processed}</span></p>
            <p>Records successfully imported: <span className="font-medium text-green-600">{result.inserted}</span></p>
            {result.invalid > 0 && (
              <p>Invalid records skipped: <span className="font-medium text-amber-600">{result.invalid}</span></p>
            )}
          </div>
        </AlertDescription>
      </Alert>
      
      {result.invalid > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Invalid Records</h4>
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            <ul className="list-disc list-inside text-xs">
              {result.invalidRecords?.slice(0, 10).map((item, index) => (
                <li key={index} className="text-muted-foreground">
                  {item.reason}: {JSON.stringify(item.record)}
                </li>
              ))}
              {result.invalidRecords && result.invalidRecords.length > 10 && (
                <li className="text-muted-foreground">
                  ... and {result.invalidRecords.length - 10} more
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      
      <Button variant="outline" onClick={onReset}>
        Import Another File
      </Button>
    </div>
  );
}
