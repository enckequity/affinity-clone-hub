
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Mail, Calendar, FileText, MessageSquare, Bookmark, Package } from "lucide-react";

export function IntegrationsSettings() {
  const { toast } = useToast();
  
  const handleConnect = (service: string) => {
    toast({
      title: `Connecting to ${service}`,
      description: `You'll be redirected to authenticate with ${service}.`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Connect your account with other services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <h3 className="text-sm font-medium">Email Integration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Google Gmail</p>
                  <p className="text-sm text-muted-foreground">
                    Sync your Gmail inbox with contacts and deals
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('Gmail')}
              >
                Connect
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Microsoft Outlook</p>
                  <p className="text-sm text-muted-foreground">
                    Sync your Outlook inbox with contacts and deals
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('Outlook')}
              >
                Connect
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <h3 className="text-sm font-medium">Calendar Integration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-sm text-muted-foreground">
                    Sync activities with your Google Calendar
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('Google Calendar')}
              >
                Connect
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Microsoft Outlook Calendar</p>
                  <p className="text-sm text-muted-foreground">
                    Sync activities with your Outlook Calendar
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('Outlook Calendar')}
              >
                Connect
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <h3 className="text-sm font-medium">Document Storage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Google Drive</p>
                  <p className="text-sm text-muted-foreground">
                    Connect Google Drive to store documents
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('Google Drive')}
              >
                Connect
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Microsoft OneDrive</p>
                  <p className="text-sm text-muted-foreground">
                    Connect OneDrive to store documents
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('OneDrive')}
              >
                Connect
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Dropbox</p>
                  <p className="text-sm text-muted-foreground">
                    Connect Dropbox to store documents
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('Dropbox')}
              >
                Connect
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <h3 className="text-sm font-medium">Other Integrations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your Slack workspace
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('Slack')}
              >
                Connect
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Custom Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Connect to a custom service via our API
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => handleConnect('Custom API')}
              >
                Setup
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
