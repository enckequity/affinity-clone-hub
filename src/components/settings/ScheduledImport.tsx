
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Upload, File } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function ScheduledImport() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [importTime, setImportTime] = useState('00:00');
  const [watchFolder, setWatchFolder] = useState('/imports');
  const [fileFormat, setFileFormat] = useState<'json' | 'csv'>('json');
  
  // Fetch scheduled import settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['scheduled-import-settings'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('scheduled_import_settings')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching scheduled import settings:", error);
        return null;
      }
      
      // Initialize state with saved settings
      if (data?.scheduled_import_settings) {
        const savedSettings = data.scheduled_import_settings;
        setEnabled(savedSettings.enabled || false);
        setImportTime(savedSettings.importTime || '00:00');
        setWatchFolder(savedSettings.watchFolder || '/imports');
        setFileFormat(savedSettings.fileFormat || 'json');
      }
      
      return data?.scheduled_import_settings;
    },
    enabled: !!user
  });
  
  const saveSettings = async () => {
    if (!user) return;
    
    const newSettings = {
      enabled,
      importTime,
      watchFolder,
      fileFormat,
      updatedAt: new Date().toISOString()
    };
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          scheduled_import_settings: newSettings
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: enabled 
          ? "Scheduled imports have been enabled" 
          : "Scheduled import settings have been saved",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save scheduled import settings",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled File Import</CardTitle>
        <CardDescription>
          Configure automatic daily import of communication files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableScheduled">Enable Scheduled Import</Label>
            <p className="text-sm text-muted-foreground">
              Automatically import communications from files at a scheduled time
            </p>
          </div>
          <Switch
            id="enableScheduled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
        
        {enabled && (
          <div className="space-y-4 pl-6 border-l-2 border-muted ml-2">
            <div className="space-y-2">
              <Label htmlFor="importTime">Import Time</Label>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <Input
                  id="importTime"
                  type="time"
                  value={importTime}
                  onChange={(e) => setImportTime(e.target.value)}
                  className="w-40"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Files will be imported daily at this time
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="watchFolder">Watch Folder Path</Label>
              <div className="flex items-center">
                <File className="w-4 h-4 mr-2 text-muted-foreground" />
                <Input
                  id="watchFolder"
                  value={watchFolder}
                  onChange={(e) => setWatchFolder(e.target.value)}
                  placeholder="/path/to/import/folder"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Files in this folder will be automatically imported
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fileFormat">File Format</Label>
              <Select value={fileFormat} onValueChange={(value: 'json' | 'csv') => setFileFormat(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select file format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Format of the files that will be imported
              </p>
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>Place files in the specified watch folder for automatic import</li>
            <li>Files must be in the selected format ({fileFormat.toUpperCase()})</li>
            <li>Successfully imported files will be moved to a completed folder</li>
            <li>Failed imports will remain in the folder with an error log</li>
          </ul>
        </div>
        
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" className="mr-2">Cancel</Button>
        <Button onClick={saveSettings}>Save Settings</Button>
      </CardFooter>
    </Card>
  );
}
