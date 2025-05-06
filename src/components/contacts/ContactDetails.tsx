
import React, { useState } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Mail, Phone, Globe, Building2, MapPin, User2, Clock, MessageSquare } from "lucide-react";
import { AddNoteDialog } from "../activities/AddNoteDialog";
import { ContactCommunications } from './ContactCommunications';

interface ContactDetailsProps {
  contact: any;
  onClose: () => void;
}

export function ContactDetails({ contact, onClose }: ContactDetailsProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const getInitials = () => {
    return contact.avatarInitials || (contact.name ? contact.name.substring(0, 2) : "CT");
  };
  
  return (
    <>
      <DialogHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{contact.name}</DialogTitle>
              <p className="text-muted-foreground">{contact.company}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </DialogHeader>
      
      <div className="mt-6">
        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="activities" className="flex-1">Activities</TabsTrigger>
            <TabsTrigger value="communications" className="flex-1">Communications</TabsTrigger>
            <TabsTrigger value="deals" className="flex-1">Deals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm">{contact.email || "No email provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm">{contact.phone || "No phone provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm">{contact.company || "Not associated with a company"}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contact.tags && contact.tags.length > 0 ? 
                        contact.tags.map((tag: string, index: number) => (
                          <span key={index} className="bg-muted text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        )) : 
                        <p className="text-sm">No tags</p>
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm">{"Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Last Interaction</p>
                    <p className="text-sm">{contact.lastInteraction || "No recent interactions"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <div className="bg-muted rounded-md p-4 min-h-[100px] text-sm">
                <p>{contact.notes || "No notes have been added for this contact."}</p>
              </div>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsAddingNote(true)}>
                  Add Note
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activities" className="mt-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex items-center justify-center rounded-full bg-muted w-12 h-12 mb-3">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No activities</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                No activities have been scheduled with this contact yet.
              </p>
              <Button variant="outline" className="mt-4">
                Schedule Activity
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="communications" className="mt-4">
            <ContactCommunications contactId={contact.id} />
          </TabsContent>
          
          <TabsContent value="deals" className="mt-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex items-center justify-center rounded-full bg-muted w-12 h-12 mb-3">
                <Globe className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No deals</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                This contact is not associated with any deals yet.
              </p>
              <Button variant="outline" className="mt-4">
                Create Deal
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <AddNoteDialog 
        open={isAddingNote}
        onOpenChange={setIsAddingNote}
        entityId={contact.id}
        entityType="contact"
      />
    </>
  );
}
