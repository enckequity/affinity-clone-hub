import React, { useState, useEffect } from 'react';
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
  CreditCard as CreditCardIcon, Calendar, Bookmark, Package, Phone,
  CheckCircle, Loader2, RefreshCw, AlertCircle
} from "lucide-react";
import { InviteTeamMember } from '@/components/settings/InviteTeamMember';
import { CommunicationsSettings } from '@/components/settings/CommunicationsSettings';
import { ContactMappings } from '@/components/settings/ContactMappings';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useSubscription } from '@/hooks/use-subscription';
import { format } from 'date-fns';

// Define the price IDs for each plan - use your actual Stripe price IDs
const PLAN_PRICE_IDS = {
  basic: 'price_1RN0uSH5uTyBP7nHvxZowhIu', 
  professional: 'price_1RN0upH5uTyBP7nHVwGiuEy1', 
  enterprise: 'price_1RN0v3H5uTyBP7nHLSUpOLyO'
};

const Settings = () => {
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { status, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    // Check for success or canceled payment status
    const paymentStatus = searchParams.get('status');
    if (paymentStatus === 'success') {
      toast({
        title: 'Payment Successful',
        description: 'Your subscription has been activated successfully.',
      });
      // Remove the status param
      searchParams.delete('status');
      setSearchParams(searchParams);
      // Refresh subscription status
      checkSubscription();
    } else if (paymentStatus === 'canceled') {
      toast({
        title: 'Payment Canceled',
        description: 'Your subscription payment was canceled.',
        variant: 'destructive',
      });
      searchParams.delete('status');
      setSearchParams(searchParams);
    }
  }, [searchParams, toast, checkSubscription, setSearchParams]);
  
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };

  const handleCheckoutBasic = () => {
    createCheckout(PLAN_PRICE_IDS.basic, 'Basic');
  };

  const handleCheckoutProfessional = () => {
    createCheckout(PLAN_PRICE_IDS.professional, 'Professional');
  };

  const handleCheckoutEnterprise = () => {
    createCheckout(PLAN_PRICE_IDS.enterprise, 'Enterprise');
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                  <Input id="email" placeholder="Enter your email" type="email" defaultValue={user?.email || ''} disabled />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={checkSubscription}
                  disabled={status.isLoading}
                >
                  {status.isLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Refresh
                </Button>
                {status.subscribed && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={openCustomerPortal}
                  >
                    Manage Subscription
                  </Button>
                )}
              </div>
            </CardHeader>
            
            {status.error && (
              <CardContent>
                <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error checking subscription status</p>
                    <p className="text-sm mt-1">{status.error}</p>
                    <p className="text-sm mt-2">Make sure your Stripe integration is properly configured and that valid price IDs are used.</p>
                  </div>
                </div>
              </CardContent>
            )}
            
            <CardContent className="space-y-4">
              {status.isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p>Checking subscription status...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`border-2 ${status.subscription_tier === 'Basic' ? 'border-primary' : ''}`}>
                    <CardHeader className="pb-2 relative">
                      {status.subscription_tier === 'Basic' && (
                        <Badge className="absolute top-2 right-2">Current Plan</Badge>
                      )}
                      <CardTitle>Basic</CardTitle>
                      <CardDescription>
                        For individuals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-1">$9<span className="text-sm text-muted-foreground font-normal"> / user / month</span></div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Billed annually ($108 / year)
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                          Basic CRM features
                        </li>
                        <li className="flex items-center">
                          <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                          100 contacts
                        </li>
                        <li className="flex items-center">
                          <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                          Basic reporting
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {status.subscription_tier === 'Basic' ? (
                        <Button className="w-full" variant="outline" onClick={openCustomerPortal}>
                          Manage Plan
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={handleCheckoutBasic}>
                          {status.subscribed ? 'Switch to Basic' : 'Subscribe'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                  
                  <Card className={`border-2 ${status.subscription_tier === 'Professional' ? 'border-primary' : ''}`}>
                    <CardHeader className="pb-2 relative">
                      {status.subscription_tier === 'Professional' && (
                        <Badge className="absolute top-2 right-2">Current Plan</Badge>
                      )}
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
                      {status.subscription_tier === 'Professional' ? (
                        <Button className="w-full" variant="outline" onClick={openCustomerPortal}>
                          Manage Plan
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={handleCheckoutProfessional}>
                          {status.subscribed ? 'Switch to Professional' : 'Subscribe'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                  
                  <Card className={`border-2 ${status.subscription_tier === 'Enterprise' ? 'border-primary' : ''}`}>
                    <CardHeader className="pb-2 relative">
                      {status.subscription_tier === 'Enterprise' && (
                        <Badge className="absolute top-2 right-2">Current Plan</Badge>
                      )}
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
                          All Professional features
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
                      {status.subscription_tier === 'Enterprise' ? (
                        <Button className="w-full" variant="outline" onClick={openCustomerPortal}>
                          Manage Plan
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={handleCheckoutEnterprise}>
                          {status.subscribed ? 'Switch to Enterprise' : 'Subscribe'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              )}
              
              {status.subscribed && (
                <>
                  <div className="mt-4 p-4 bg-primary/10 rounded-md">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Active Subscription</h3>
                        <p className="text-sm text-muted-foreground">
                          You are currently subscribed to the {status.subscription_tier} plan.
                          {status.subscription_end && (
                            <> Your subscription renews on {formatDate(status.subscription_end)}.</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                </>
              )}
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment Information</h3>
                <div className="flex justify-between items-center p-4 border rounded-md">
                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="h-10 w-10 p-2 bg-muted rounded-md" />
                    <div>
                      <p className="font-medium">Add payment method</p>
                      <p className="text-sm text-muted-foreground">Add a credit card or other payment method</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={openCustomerPortal}>Manage Payment</Button>
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
                    {status.subscribed ? (
                      <TableRow>
                        <TableCell>{formatDate(status.subscription_end ? new Date(new Date(status.subscription_end).getTime() - (365 * 24 * 60 * 60 * 1000)).toISOString() : null)}</TableCell>
                        <TableCell>{status.subscription_tier} Plan (Annual)</TableCell>
                        <TableCell>
                          {status.subscription_tier === 'Basic' && '$108.00'}
                          {status.subscription_tier === 'Professional' && '$348.00'}
                          {status.subscription_tier === 'Enterprise' && '$1,068.00'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" size="sm" className="h-auto p-0" onClick={openCustomerPortal}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No billing history available
                        </TableCell>
                      </TableRow>
                    )}
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
