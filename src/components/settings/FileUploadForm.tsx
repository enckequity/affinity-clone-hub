
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Info, AlertCircle, FileType, Zap, Inbox } from "lucide-react";
import { FileUploadState } from "@/types/fileImport";
import { Switch } from "@/components/ui/switch";

interface FileUploadFormProps {
  state: FileUploadState;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onReset: () => void;
  onToggleForceImport?: () => void;
}

export function FileUploadForm({ 
  state, 
  onFileChange, 
  onUpload, 
  onReset,
  onToggleForceImport 
}: FileUploadFormProps) {
  const { file, isUploading, uploadProgress, error, showConfirm, parsedData, fileFormat, forceImport, processingMode } = state;
  
  const isBulkMode = processingMode === 'bulk';
  
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
          {isBulkMode 
            ? "Upload your bulk iMessage export CSV file. We'll process it in chunks."
            : "Upload your message history CSV file. We support standard CSV formats and iMessage exports."}
        </p>
        
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            id="force-import"
            checked={!!forceImport}
            onCheckedChange={onToggleForceImport}
            disabled={isUploading}
          />
          <Label htmlFor="force-import" className="cursor-pointer flex items-center">
            <Zap className="h-4 w-4 mr-1 text-amber-500" />
            Force Import Mode
          </Label>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Enable Force Import to bypass strict format checking and map common CSV headers automatically.
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
      
      {showConfirm && (isBulkMode || parsedData) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Ready to Import</AlertTitle>
          <AlertDescription className="space-y-2">
            {isBulkMode ? (
              <p>File ready for bulk import. Click 'Import Data' to process in chunks.</p>
            ) : (
              <p>Found {parsedData?.length} message records. Click 'Import Data' to continue.</p>
            )}
            
            {fileFormat && (
              <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                <FileType className="h-3 w-3" />
                <span>Detected format: {fileFormat === 'imazing' ? 'iMessage Export' : fileFormat === 'standard' ? 'Standard CSV' : 'Unknown'}</span>
              </div>
            )}
            
            {isBulkMode && (
              <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                <Inbox className="h-3 w-3" />
                <span>Bulk import mode enabled - large files will be processed in chunks.</span>
              </div>
            )}
            
            {forceImport && (
              <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                <Zap className="h-3 w-3" />
                <span>Force Import Mode is enabled. Automatic header mapping will be applied.</span>
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
