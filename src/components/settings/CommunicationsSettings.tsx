
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format } from 'date-fns';
import { useCommunications } from '@/hooks/use-communications';
import { FileImport } from '@/components/settings/FileImport';

export function CommunicationsSettings() {
  const {
    syncLogs,
    isLoadingSyncLogs
  } = useCommunications();

  return (
    <div className="space-y-6">
      <FileImport />
      
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            Recent import operations and their status
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
              <p className="text-lg font-medium">No import history yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Import history will appear here once you've completed your first import
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
                           log.sync_type === 'import' ? 'File Import' : 'Daily'}
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
    </div>
  );
}
