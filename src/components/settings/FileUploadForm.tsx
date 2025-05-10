
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Info, AlertCircle, FileType } from "lucide-react";
import { FileUploadState } from "@/types/fileImport";

interface FileUploadFormProps {
  state: FileUploadState;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onReset: () => void;
}

export function FileUploadForm({ state, onFileChange, onUpload, onReset }: FileUploadFormProps) {
  const { file, isUploading, uploadProgress, error, showConfirm, parsedData, fileFormat } = state;
  
  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="communications-file">Upload CSV File</Label>
        <Input
          id="communications-file"
          type="file"
          accept=".csv"
          onChange={onFileChange}
          disabled={isUploading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Upload your message history CSV file. We support standard CSV formats and iMessage exports.
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {showConfirm && parsedData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Ready to Import</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Found {parsedData.length} message records. Click 'Import Data' to continue.</p>
            {fileFormat && (
              <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                <FileType className="h-3 w-3" />
                <span>Detected format: {fileFormat === 'imazing' ? 'iMessage Export' : fileFormat === 'standard' ? 'Standard CSV' : 'Unknown'}</span>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {isUploading && (
        <div className="space-y-2">
          <Label>Uploading...</Label>
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-xs text-muted-foreground">
            Please don't close this window while the import is in progress. Large files may take several minutes.
          </p>
        </div>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onReset} disabled={!file || isUploading}>
          Cancel
        </Button>
        
        {showConfirm && !isUploading && (
          <Button 
            onClick={onUpload} 
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        )}
      </div>
    </div>
  );
}
