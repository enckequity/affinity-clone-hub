
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
  const [fileFormat, setFileFormat] = useState<'json' | 'csv'>('json');
  
  // Fetch daily import settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['daily-import-settings'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching daily import settings:", error);
        return null;
      }
      
      // Initialize state with saved settings
      if (data) {
        setEnabled(data.import_enabled || false);
        setImportTime(data.daily_import_time || '00:00');
      }
      
      return data;
    },
    enabled: !!user
  });
  
  const saveSettings = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          import_enabled: enabled,
          daily_import_time: importTime
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: enabled 
          ? "Daily imports have been enabled" 
          : "Daily import settings have been saved",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save daily import settings",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily File Import</CardTitle>
        <CardDescription>
          Configure automatic daily import of communication files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableScheduled">Enable Daily Import</Label>
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
            <li>Your communications will be imported daily at the specified time</li>
            <li>Files must be in the selected format ({fileFormat.toUpperCase()})</li>
            <li>Successfully imported communications will be added to your history</li>
            <li>Duplicate records will be automatically skipped</li>
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
