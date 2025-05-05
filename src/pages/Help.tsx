
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Video, MessageCircle, BookOpen } from "lucide-react";

const Help = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">Find answers, tutorials, and support resources.</p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input className="w-full pl-10 py-6 text-lg" placeholder="Search for help articles..." />
      </div>
      
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="faq" className="flex gap-2">
            <FileText className="h-4 w-4" />
            <span>FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex gap-2">
            <Video className="h-4 w-4" />
            <span>Tutorials</span>
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Documentation</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Support</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq" className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create a new contact?</AccordionTrigger>
              <AccordionContent>
                To create a new contact, navigate to the Contacts page using the sidebar menu and click the "Add Contact" button in the top right corner. Fill in the contact information in the form and click "Save" to create the contact.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I create and manage deals?</AccordionTrigger>
              <AccordionContent>
                You can create a new deal by navigating to the Deals page and clicking "Add Deal". Deals can be managed using either the Kanban board view or the list view. Drag deals between stages in the Kanban view to update their status.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I set up automated workflows?</AccordionTrigger>
              <AccordionContent>
                Automated workflows can be created in the Workflows section. Click "Create Workflow" and use the visual workflow builder to define triggers and actions. You can automate tasks such as email notifications, task creation, and deal updates.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>How do I use the AI Assistant?</AccordionTrigger>
              <AccordionContent>
                The AI Assistant can be accessed from the icon in the top navigation bar. You can ask it questions about your data, get relationship insights, or use natural language to search for information across your CRM.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I import contacts from another system?</AccordionTrigger>
              <AccordionContent>
                Go to Settings &gt; Import/Export and select the "Import" option. You can upload a CSV file with your contacts data. Follow the mapping wizard to match your CSV columns with the contact fields in the system.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="tutorials" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started Guide</CardTitle>
              <CardDescription>Learn the basics of using the CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Watch Tutorial</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline Management</CardTitle>
              <CardDescription>Master deal tracking and forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Watch Tutorial</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Workflow Automation</CardTitle>
              <CardDescription>Create powerful automated processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <Video className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Watch Tutorial</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Guide</CardTitle>
                <CardDescription>Complete product documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Comprehensive guide to all features and functionality of the CRM platform.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Documentation</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
                <CardDescription>Developer documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Technical reference for integrating with our API and extending functionality.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View API Docs</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="What do you need help with?" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea 
                  className="min-h-32 w-full border rounded-md p-3 text-sm" 
                  placeholder="Describe your issue in detail..."
                ></textarea>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Submit Support Request</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
