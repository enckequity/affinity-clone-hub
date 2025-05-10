
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TeamSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Manage your team and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Team functionality is temporarily disabled</AlertTitle>
          <AlertDescription>
            Team functionality has been temporarily disabled for maintenance. 
            It will be enabled again in a future update.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
