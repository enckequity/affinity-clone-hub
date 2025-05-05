
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  Calendar, 
  MessageSquare,
  Edit,
  Trash2,
  Clock,
  User,
  MapPin,
  Globe,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { ContactForm } from './ContactForm';

interface ContactDetailsProps {
  contact: any;
  onClose: () => void;
}

export function ContactDetails({ contact, onClose }: ContactDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <ContactForm 
          existingContact={{
            firstName: contact.name.split(' ')[0],
            lastName: contact.name.split(' ')[1],
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            tags: contact.tags
          }} 
          onComplete={() => setIsEditing(false)} 
        />
      </>
    );
  }
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{contact.avatarInitials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl mb-1">{contact.name}</DialogTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {contact.company}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsEditing(true)} 
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>
      
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Contact Information</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="text-primary">
                    {contact.email}
                  </a>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${contact.phone}`} className="text-primary">
                    {contact.phone}
                  </a>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.company}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>VP of Marketing</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Additional Details</h3>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>San Francisco, CA</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href="#" className="text-primary">linkedin.com/in/jsmith</a>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last contacted: {contact.lastInteraction}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notes</h3>
              <div className="bg-muted/30 p-3 rounded-md text-sm">
                <p>Met at TechConf 2023. Interested in our enterprise solution for their marketing team. Follow up next quarter about budget approval.</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Upcoming Tasks</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">Follow up about proposal</p>
                      <p className="text-xs text-muted-foreground">Due tomorrow</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-sm">Send product spec sheet</p>
                      <p className="text-xs text-destructive">Overdue by 2 days</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Recent Activity</h3>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View all
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Mail className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">Email sent</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Phone className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm">Call completed</p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <FileText className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm">Note added</p>
                      <p className="text-xs text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Activity Timeline</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-1" />
                  Log Activity
                </Button>
              </div>
            </div>
            
            <div className="pb-4">
              <RecentActivities />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="deals" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Related Deals</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add to Deal
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Expected Close</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Enterprise Solution</div>
                      <div className="text-xs text-muted-foreground">{contact.company}</div>
                    </TableCell>
                    <TableCell>$45,000</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500">Proposal</Badge>
                    </TableCell>
                    <TableCell>Aug 15, 2023</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

// Import Table components within the same file since they're only used here
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
