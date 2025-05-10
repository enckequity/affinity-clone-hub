
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useSettingsTabs } from '@/hooks/use-settings-tabs';

// Import individual tab components
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { CommunicationsSettings } from '@/components/settings/CommunicationsSettings';
import { BillingSettings } from '@/components/settings/BillingSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { activeTab, handleTabChange } = useSettingsTabs();
  
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
    } else if (paymentStatus === 'canceled') {
      toast({
        title: 'Payment Canceled',
        description: 'Your subscription payment was canceled.',
        variant: 'destructive',
      });
      searchParams.delete('status');
      setSearchParams(searchParams);
    }
  }, [searchParams, toast, setSearchParams]);
  
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
          {/* Team tab removed */}
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <AccountSettings />
        </TabsContent>
        
        {/* Team tab content removed */}
        
        <TabsContent value="communications" className="space-y-8">
          <CommunicationsSettings />
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <BillingSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
