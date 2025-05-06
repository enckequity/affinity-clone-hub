
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ImportResult {
  processed: number;
  inserted: number;
  invalid: number;
  invalidRecords: Array<{ record: any; reason: string }>;
  sync_id: string;
}

export function FileImport() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Reset states
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setParsedData(null);
    setShowConfirm(false);
    
    // Validate file type
    if (!selectedFile.name.endsWith('.json') && !selectedFile.name.endsWith('.csv')) {
      setError("Please upload a JSON or CSV file");
      return;
    }
    
    // Parse the file
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) return;
        
        let data;
        if (selectedFile.name.endsWith('.json')) {
          data = JSON.parse(event.target.result as string);
          if (!Array.isArray(data)) {
            data = [data]; // Convert object to array if it's not already an array
          }
        } else {
          // Simple CSV parsing (could use a library for more robust parsing)
          const csv = event.target.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          data = lines.slice(1).map(line => {
            if (!line.trim()) return null; // Skip empty lines
            
            const values = line.split(',');
            const obj: Record<string, string> = {};
            
            headers.forEach((header, i) => {
              obj[header] = values[i]?.trim() || '';
            });
            
            return obj;
          }).filter(Boolean);
        }
        
        if (!data || data.length === 0) {
          setError("No valid data found in the file");
          return;
        }
        
        setParsedData(data);
        setShowConfirm(true);
      } catch (err: any) {
        console.error("Error parsing file:", err);
        setError(`Failed to parse file: ${err.message}`);
      }
    };
    
    reader.onerror = () => {
      setError("Failed to read the file");
    };
    
    if (selectedFile.name.endsWith('.json')) {
      reader.readAsText(selectedFile);
    } else {
      reader.readAsText(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!parsedData) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Authentication required. Please log in.");
      }
      
      setUploadProgress(30);
      
      // Call the edge function to process the data
      const response = await supabase.functions.invoke('process-communications-import', {
        body: {
          communications: parsedData,
          sync_type: 'import'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      setUploadProgress(90);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to process data");
      }
      
      setUploadProgress(100);
      setResult(response.data as ImportResult);
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${response.data.inserted} communications.`,
      });
      
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(err.message || "An error occurred during upload");
      
      toast({
        title: "Import failed",
        description: err.message || "Failed to import communications",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setShowConfirm(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setError(null);
    setResult(null);
    setParsedData(null);
    setShowConfirm(false);
    setUploadProgress(0);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Communications</CardTitle>
        <CardDescription>
          Upload communication data from your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && (
          <>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="communications-file">Upload File</Label>
              <Input
                id="communications-file"
                type="file"
                accept=".json,.csv"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JSON, CSV
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
                <AlertDescription>
                  Found {parsedData.length} communication records. Click 'Import Data' to continue.
                </AlertDescription>
              </Alert>
            )}
            
            {isUploading && (
              <div className="space-y-2">
                <Label>Uploading...</Label>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  Please don't close this window while the import is in progress.
                </p>
              </div>
            )}
          </>
        )}
        
        {result && (
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
                    {result.invalidRecords.slice(0, 10).map((item, index) => (
                      <li key={index} className="text-muted-foreground">
                        {item.reason}: {JSON.stringify(item.record)}
                      </li>
                    ))}
                    {result.invalidRecords.length > 10 && (
                      <li className="text-muted-foreground">
                        ... and {result.invalidRecords.length - 10} more
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!result && !isUploading && (
          <>
            <Button variant="outline" onClick={resetForm} disabled={!file || isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!showConfirm || isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </>
        )}
        
        {(result || isUploading) && (
          <Button variant="outline" onClick={resetForm} disabled={isUploading}>
            Import Another File
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
