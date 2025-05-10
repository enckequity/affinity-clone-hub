
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileUploadForm } from './FileUploadForm';
import { ImportResultDisplay } from './ImportResultDisplay';
import { useFileImport } from '@/hooks/use-file-import';

export function FileImport() {
  const { state, handleFileChange, handleUpload, resetForm, toggleForceImport } = useFileImport();
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Import CSV</CardTitle>
          <CardDescription>
            Upload communication data from your CSV files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!state.result ? (
            <FileUploadForm 
              state={state}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
              onReset={resetForm}
              onToggleForceImport={toggleForceImport}
            />
          ) : (
            <ImportResultDisplay
              result={state.result}
              onReset={resetForm}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
