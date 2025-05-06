import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Mail, CreditCard, Bell, CalendarClock, MessageSquare, 
  PlusCircle, FileText, Inbox, LogOut, Database, Users, Plus, 
  CreditCard as CreditCardIcon, Calendar, Bookmark, Package, Phone
} from "lucide-react";
import { InviteTeamMember } from '@/components/settings/InviteTeamMember';
import { CommunicationsSettings } from '@/components/settings/CommunicationsSettings';
import { ContactMappings } from '@/components/settings/ContactMappings';

const Settings = () => {
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved."
    });
  };
  
  const handleUpdateAccount = () => {
    toast({
      title: "Account updated",
      description: "Your account settings have been saved."
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved."
    });
  };
  
  const handleConnect = (service: string) => {
    toast({
      title: `Connecting to ${service}`,
      description: `You'll be redirected to authenticate with ${service}.`
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
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
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" defaultValue="Doe" />
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
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="Enter your email" type="email" defaultValue="john.doe@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value="************" disabled />
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and updates
                    </p>
                  </div>
                  <Switch id="marketing" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sessions">Active Sessions</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage devices where you're currently logged in
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Manage Sessions</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>
                
                <Button onClick={handleUpdateAccount}>Update Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your team and their permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setIsInviting(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-xs text-muted-foreground">Sales Manager</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>john.doe@example.com</TableCell>
                    <TableCell>
                      <Badge>Admin</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Jane Smith</p>
                          <p className="text-xs text-muted-foreground">Sales Representative</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>jane.smith@example.com</TableCell>
                    <TableCell>
                      <Badge>Member</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>RJ</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Robert Johnson</p>
                          <p className="text-xs text-muted-foreground">Marketing Director</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>robert.j@example.com</TableCell>
                    <TableCell>
                      <Badge>Manager</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communications" className="space-y-8">
          <CommunicationsSettings />
          <ContactMappings />
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <Badge className="self-start mb-2">Current Plan</Badge>
                    <CardTitle>Professional</CardTitle>
                    <CardDescription>
                      For growing teams
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">$29<span className="text-sm text-muted-foreground font-normal"> / user / month</span></div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Billed annually ($348 / year)
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        Unlimited contacts
                      </li>
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        Advanced reporting
                      </li>
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        Email integration
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">Manage Subscription</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Team</CardTitle>
                    <CardDescription>
                      For established teams
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">$49<span className="text-sm text-muted-foreground font-normal"> / user / month</span></div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Billed annually ($588 / year)
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        All Professional features
                      </li>
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        Advanced workflows
                      </li>
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        Advanced permissions
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Upgrade</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Enterprise</CardTitle>
                    <CardDescription>
                      For large organizations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">$89<span className="text-sm text-muted-foreground font-normal"> / user / month</span></div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Billed annually ($1,068 / year)
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        All Team features
                      </li>
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        Advanced security
                      </li>
                      <li className="flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                        Dedicated support
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Upgrade</Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Information</h3>
                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="h-10 w-10 p-2 bg-muted rounded-md" />
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2024</p>
                    </div>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
                
                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="h-10 w-10 p-2 bg-muted rounded-md" />
                    <div>
                      <p className="font-medium">Add new payment method</p>
                      <p className="text-sm text-muted-foreground">Use a different card or payment method</p>
                    </div>
                  </div>
                  <Button variant="outline">Add</Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Billing History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>May 1, 2023</TableCell>
                      <TableCell>Professional Plan (Annual)</TableCell>
                      <TableCell>$348.00</TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Apr 1, 2022</TableCell>
                      <TableCell>Professional Plan (Annual)</TableCell>
                      <TableCell>$348.00</TableCell>
                      <TableCell className="text-right">
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
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
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
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
        </TabsContent>
      </Tabs>
      
      <InviteTeamMember open={isInviting} onOpenChange={setIsInviting} />
    </div>
  );
};

export default Settings;
