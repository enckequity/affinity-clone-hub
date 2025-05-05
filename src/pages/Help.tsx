
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Search, MessageSquare } from "lucide-react";
import { LiveChat } from '@/components/support/LiveChat';

export default function Help() {
  const [liveChat, setLiveChat] = useState(false);
  const { toast } = useToast();
  
  const handleSupportFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support request submitted",
      description: "We've received your request and will get back to you soon.",
    });
    // Reset form
    const form = e.target as HTMLFormElement;
    form.reset();
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Find answers to your questions and get support when you need it.</p>
      </div>
      
      <div className="bg-muted/40 rounded-lg p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Need instant help?</h2>
          <p className="text-muted-foreground">Our AI assistant can help answer your questions in real-time</p>
        </div>
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => setLiveChat(true)}
        >
          <MessageSquare className="h-5 w-5" />
          Start Live Chat
        </Button>
      </div>
      
      <Tabs defaultValue="faqs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faqs" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search FAQs..." 
              className="pl-9 w-full" 
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about using our CRM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-medium">How do I import my existing contacts?</h3>
                <p className="text-sm text-muted-foreground">You can import contacts by going to the Contacts page and clicking "Import Contacts". We support CSV and Excel file formats.</p>
              </div>
              <Separator />
              
              <div className="space-y-1">
                <h3 className="font-medium">How do I set up email integration?</h3>
                <p className="text-sm text-muted-foreground">Go to Settings {'->'} Integrations and connect your Microsoft or Google account to enable email integration.</p>
              </div>
              <Separator />
              
              <div className="space-y-1">
                <h3 className="font-medium">Can I customize the deal stages?</h3>
                <p className="text-sm text-muted-foreground">Yes, you can customize deal stages by going to Settings {'->'} Deals and clicking "Customize Stages".</p>
              </div>
              <Separator />
              
              <div className="space-y-1">
                <h3 className="font-medium">How do I invite team members?</h3>
                <p className="text-sm text-muted-foreground">Go to Settings {'->'} Team and click "Invite Team Member" to send an invitation via email.</p>
              </div>
              <Separator />
              
              <div className="space-y-1">
                <h3 className="font-medium">How do billing and subscriptions work?</h3>
                <p className="text-sm text-muted-foreground">You can manage your subscription in Settings {'->'} Billing. We offer monthly and annual plans with per-user pricing.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Submit a support request and we'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSupportFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" placeholder="Your email" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" placeholder="Support request subject" required />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your issue in detail..." 
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">Submit Support Request</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <LiveChat open={liveChat} onOpenChange={setLiveChat} />
    </div>
  );
}
