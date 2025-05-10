
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { FileUploadForm } from './FileUploadForm';
import { ImportResultDisplay } from './ImportResultDisplay';
import { parseFileContent } from '@/utils/fileParsingUtils';
import { FileUploadState, ImportResult, UserSettings } from '@/types/fileImport';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { useCommunications } from '@/hooks/use-communications';
import { format } from 'date-fns';

export function FileImport() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userSettings, updateUserSettings } = useCommunications();
  const [importEnabled, setImportEnabled] = useState(false);
  const [importTime, setImportTime] = useState('00:00');
  const [state, setState] = useState<FileUploadState>({
    file: null,
    isUploading: false,
    uploadProgress: 0,
    result: null,
    error: null,
    parsedData: null,
    showConfirm: false,
    fileFormat: 'unknown'
  });

  // Initialize state from user settings
  useEffect(() => {
    if (userSettings) {
      setImportEnabled(userSettings.import_enabled || false);
      
      // Convert time from database format to input format
      if (userSettings.daily_import_time) {
        const timeObj = new Date(userSettings.daily_import_time);
        const hours = String(timeObj.getUTCHours()).padStart(2, '0');
        const minutes = String(timeObj.getUTCMinutes()).padStart(2, '0');
        setImportTime(`${hours}:${minutes}`);
      }
    }
  }, [userSettings]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      // Parse the time from input format to database format
      const [hours, minutes] = importTime.split(':').map(Number);
      const timeValue = new Date();
      timeValue.setUTCHours(hours, minutes, 0, 0);
      
      await updateUserSettings.mutateAsync({
        import_enabled: importEnabled,
        daily_import_time: timeValue.toISOString()
      });
      
      toast({
        title: "Settings saved",
        description: "Your daily import settings have been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Reset states
    setState(prev => ({
      ...prev,
      file: selectedFile,
      error: null,
      result: null,
      parsedData: null,
      showConfirm: false,
      fileFormat: 'unknown',
      uploadProgress: 0
    }));
    
    // Validate file type
    if (!selectedFile.name.endsWith('.json') && !selectedFile.name.endsWith('.csv')) {
      setState(prev => ({
        ...prev,
        error: "Please upload a JSON or CSV file"
      }));
      return;
    }
    
    // Parse the file
    try {
      const { data, fileFormat } = await parseFileContent(selectedFile);
      
      setState(prev => ({
        ...prev,
        parsedData: data,
        showConfirm: true,
        fileFormat
      }));
    } catch (err: any) {
      console.error("Error parsing file:", err);
      setState(prev => ({
        ...prev,
        error: `Failed to parse file: ${err.message}`
      }));
    }
  };
  
  const handleUpload = async () => {
    if (!state.parsedData) return;
    
    try {
      setState(prev => ({ ...prev, isUploading: true, uploadProgress: 10 }));
      
      // Get user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Authentication required. Please log in.");
      }
      
      setState(prev => ({ ...prev, uploadProgress: 30 }));
      
      // Call the edge function to process the data
      const response = await supabase.functions.invoke('process-communications-import', {
        body: {
          communications: state.parsedData,
          sync_type: 'import',
          user_id: session.user.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      setState(prev => ({ ...prev, uploadProgress: 90 }));
      
      if (response.error) {
        console.error("Error response from edge function:", response.error);
        throw new Error(response.error.message || "Failed to process data");
      }
      
      setState(prev => ({
        ...prev,
        uploadProgress: 100,
        result: response.data as ImportResult
      }));
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${response.data.inserted} communications.`,
      });
      
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setState(prev => ({
        ...prev,
        error: err.message || "An error occurred during upload"
      }));
      
      toast({
        title: "Import failed",
        description: err.message || "Failed to import communications",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({
        ...prev,
        isUploading: false,
        showConfirm: false
      }));
    }
  };
  
  const resetForm = () => {
    setState({
      file: null,
      isUploading: false,
      uploadProgress: 0,
      result: null,
      error: null,
      parsedData: null,
      showConfirm: false,
      fileFormat: 'unknown'
    });
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily Import Settings</CardTitle>
          <CardDescription>
            Configure automatic daily import of your communications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="importEnabled">Enable Daily Import</Label>
              <p className="text-sm text-muted-foreground">
                Automatically import your communications once per day
              </p>
            </div>
            <Switch
              id="importEnabled"
              checked={importEnabled}
              onCheckedChange={setImportEnabled}
            />
          </div>
          
          {importEnabled && (
            <div className="space-y-2">
              <Label htmlFor="importTime">Import Time (UTC)</Label>
              <Input
                id="importTime"
                type="time"
                value={importTime}
                onChange={(e) => setImportTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set the time when communications will be imported daily (in UTC)
              </p>
            </div>
          )}
          
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Import</CardTitle>
          <CardDescription>
            Upload communications data from your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!state.result ? (
            <FileUploadForm 
              state={state}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
              onReset={resetForm}
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
