
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { toast } = useToast();
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email Notifications</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dealUpdates">Deal updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when deals change status
              </p>
            </div>
            <Switch id="dealUpdates" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="contactActivity">Contact activity</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for new activities with contacts
              </p>
            </div>
            <Switch id="contactActivity" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="taskReminders">Task reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders for upcoming tasks
              </p>
            </div>
            <Switch id="taskReminders" defaultChecked />
          </div>
          
          <Separator />
          
          <h3 className="text-sm font-medium">In-App Notifications</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mentions">Mentions</Label>
              <p className="text-sm text-muted-foreground">
                When you're mentioned in comments or notes
              </p>
            </div>
            <Switch id="mentions" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="assignments">Assignments</Label>
              <p className="text-sm text-muted-foreground">
                When you're assigned to a deal or task
              </p>
            </div>
            <Switch id="assignments" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="teamActivity">Team activity</Label>
              <p className="text-sm text-muted-foreground">
                Updates about your team's activity
              </p>
            </div>
            <Switch id="teamActivity" defaultChecked />
          </div>
          
          <Button onClick={handleSaveNotifications}>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}
