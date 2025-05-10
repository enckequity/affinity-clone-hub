
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Phone } from "lucide-react";
import { ImportResult } from "@/types/fileImport";
import { Link } from 'react-router-dom';

interface ImportResultDisplayProps {
  result: ImportResult;
  onReset: () => void;
}

export function ImportResultDisplay({ result, onReset }: ImportResultDisplayProps) {
  return (
    <div className="space-y-4">
      <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Import Completed</AlertTitle>
        <AlertDescription>
          <div className="pt-2 space-y-1">
            <p>Total records processed: <span className="font-medium">{result.processed}</span></p>
            <p>Records successfully imported: <span className="font-medium text-green-600 dark:text-green-400">{result.inserted}</span></p>
            {(result.incoming !== undefined || result.outgoing !== undefined) && (
              <div className="pl-4 space-y-0.5 text-sm">
                {result.incoming !== undefined && (
                  <p>Incoming messages: <span className="font-medium">{result.incoming}</span></p>
                )}
                {result.outgoing !== undefined && (
                  <p>Outgoing messages: <span className="font-medium">{result.outgoing}</span></p>
                )}
              </div>
            )}
            {(result.skipped > 0) && (
              <p>Duplicate records skipped: <span className="font-medium text-amber-600 dark:text-amber-400">{result.skipped}</span></p>
            )}
            {(result.invalid > 0) && (
              <p>Invalid records: <span className="font-medium text-amber-600 dark:text-amber-400">{result.invalid}</span></p>
            )}
          </div>
        </AlertDescription>
      </Alert>
      
      {result.unmatchedPhones && result.unmatchedPhones.length > 0 && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
          <Phone className="h-4 w-4 text-blue-500" />
          <AlertTitle>Contact Resolution Needed</AlertTitle>
          <AlertDescription>
            <p className="mt-1 mb-2">
              {result.unmatchedPhones.length} phone numbers need to be linked to contacts.
            </p>
            <Link to="/import/resolve-contacts">
              <Button size="sm" className="mt-2">
                Resolve Contacts
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}
      
      {result.invalid > 0 && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Import Warnings</AlertTitle>
          <AlertDescription>
            <p className="text-sm mt-1 mb-2">Some records couldn't be imported due to validation issues.</p>
            <div className="max-h-40 overflow-y-auto border rounded p-2 dark:border-muted">
              <ul className="list-disc list-inside text-xs">
                {result.invalidRecords?.slice(0, 10).map((item, index) => (
                  <li key={index} className="text-muted-foreground text-wrap break-all">
                    {item.reason}: {JSON.stringify(item.record).substring(0, 100)}{JSON.stringify(item.record).length > 100 ? '...' : ''}
                  </li>
                ))}
                {result.invalidRecords && result.invalidRecords.length > 10 && (
                  <li className="text-muted-foreground">
                    ... and {result.invalidRecords.length - 10} more
                  </li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Button variant="outline" onClick={onReset}>
        Import Another File
      </Button>
    </div>
  );
}
