
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Upload, RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { useCommunications } from '@/hooks/use-communications';
import { Separator } from '@/components/ui/separator';
import { FileImport } from '@/components/settings/FileImport';
import { ScheduledImport } from '@/components/settings/ScheduledImport';

export function CommunicationsSettings() {
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [syncOnConnect, setSyncOnConnect] = useState(true);
  const [syncNotifications, setSyncNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'import' | 'scheduled'>('settings');
  
  const {
    syncLogs,
    isLoadingSyncLogs,
    initiateManualSync
  } = useCommunications();

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4 overflow-x-auto pb-2">
        <Button
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settings')}
        >
          <Clock className="mr-2 h-4 w-4" />
          Sync Settings
        </Button>
        <Button
          variant={activeTab === 'import' ? 'default' : 'outline'}
          onClick={() => setActiveTab('import')}
        >
          <Upload className="mr-2 h-4 w-4" />
          Manual Import
        </Button>
        <Button
          variant={activeTab === 'scheduled' ? 'default' : 'outline'}
          onClick={() => setActiveTab('scheduled')}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Scheduled Import
        </Button>
      </div>

      {activeTab === 'settings' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Communications Sync Settings</CardTitle>
              <CardDescription>
                Configure how your phone communications are synced with the CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSync">Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync communications on a schedule
                  </p>
                </div>
                <Switch
                  id="autoSync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>
              
              {autoSync && (
                <div className="space-y-2 pl-6 border-l-2 border-muted ml-2">
                  <div className="space-y-1">
                    <Label htmlFor="syncFrequency">Sync Frequency</Label>
                    <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="syncOnConnect">Sync on Device Connection</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync when your device connects to Wi-Fi
                  </p>
                </div>
                <Switch
                  id="syncOnConnect"
                  checked={syncOnConnect}
                  onCheckedChange={setSyncOnConnect}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="syncNotifications">Sync Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications when sync completes
                  </p>
                </div>
                <Switch
                  id="syncNotifications"
                  checked={syncNotifications}
                  onCheckedChange={setSyncNotifications}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={initiateManualSync} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Manual Sync
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  This will trigger a manual sync of your communications
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Note: You can also import communications data directly
              </p>
              <Button variant="outline" onClick={() => setActiveTab('import')}>Import Data</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent sync operations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSyncLogs ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : syncLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">No sync history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sync history will appear here once you've completed your first sync
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.slice(0, 5).map((log) => {
                      const startTime = new Date(log.start_time);
                      const endTime = log.end_time ? new Date(log.end_time) : null;
                      const duration = endTime
                        ? `${Math.round((endTime.getTime() - startTime.getTime()) / 1000)}s`
                        : '-';
                        
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="text-sm">
                              {format(startTime, 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(startTime, 'h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.sync_type === 'auto' ? 'Automatic' : 
                               log.sync_type === 'manual' ? 'Manual' : 
                               log.sync_type === 'import' ? 'Import' : 'Scheduled'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.status === 'completed' ? (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-700">Complete</span>
                              </div>
                            ) : log.status === 'failed' ? (
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-red-700">Failed</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <RefreshCw className="h-4 w-4 animate-spin text-blue-500 mr-1" />
                                <span className="text-blue-700">In Progress</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{log.records_synced || '-'}</TableCell>
                          <TableCell>{duration}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
      
      {activeTab === 'import' && (
        <FileImport />
      )}
      
      {activeTab === 'scheduled' && (
        <ScheduledImport />
      )}
    </div>
  );
}
