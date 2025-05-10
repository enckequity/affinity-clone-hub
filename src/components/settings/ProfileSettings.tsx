
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

export function ProfileSettings() {
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and how your profile appears
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/public/placeholder.svg" />
            <AvatarFallback>{profile?.first_name?.charAt(0) || ''}{profile?.last_name?.charAt(0) || ''}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" size="sm">Change Avatar</Button>
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="Enter your first name" defaultValue={profile?.first_name || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Enter your last name" defaultValue={profile?.last_name || ''} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" placeholder="Enter your job title" defaultValue="Sales Manager" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" placeholder="Write a short bio about yourself" defaultValue="Sales professional with 5+ years of experience in SaaS." />
          </div>
        </div>
        <Button onClick={handleSaveProfile}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}
