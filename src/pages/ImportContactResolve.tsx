
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Phone, User, Plus, ChevronsUpDown, LinkIcon } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useContacts } from '@/hooks/use-contacts';

interface PhoneContact {
  id: string;
  phone_number: string;
  contact_name: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  contact_id: string | null;
  message_preview?: string;
  message_count?: number;
}

export default function ImportContactResolve() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { contacts, isLoading: isContactsLoading } = useContacts();
  
  const [phoneContacts, setPhoneContacts] = useState<PhoneContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<PhoneContact | null>(null);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  
  // Load unmatched phone contacts
  useEffect(() => {
    const loadUnmatchedContacts = async () => {
      setIsLoading(true);
      
      try {
        // Get unmatched phone contacts (those without a contact_id)
        const { data, error } = await supabase
          .from('phone_contact_mappings')
          .select('*')
          .is('contact_id', null);
          
        if (error) throw error;
        
        // For each contact, get a preview of their messages
        const contactsWithPreviews = await Promise.all(data.map(async (contact) => {
          // Get count of messages
          const { count } = await supabase
            .from('communications')
            .select('*', { count: 'exact', head: true })
            .eq('contact_phone', contact.phone_number);
            
          // Get latest message for preview
          const { data: messages } = await supabase
            .from('communications')
            .select('content, timestamp')
            .eq('contact_phone', contact.phone_number)
            .order('timestamp', { ascending: false })
            .limit(1);
            
          const preview = messages && messages.length > 0 
            ? messages[0].content?.substring(0, 50) + (messages[0].content?.length > 50 ? '...' : '')
            : 'No message preview available';
            
          return {
            ...contact,
            message_preview: preview,
            message_count: count || 0
          };
        }));
        
        setPhoneContacts(contactsWithPreviews);
      } catch (error: any) {
        console.error('Error loading unmatched contacts:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load unmatched contacts",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUnmatchedContacts();
  }, [toast]);
  
  const handleSelectPhoneContact = (contact: PhoneContact) => {
    setSelectedContact(contact);
    // Pre-fill the new contact form with any available info
    setNewContact({
      firstName: contact.contact_name ? contact.contact_name.split(' ')[0] : '',
      lastName: contact.contact_name ? contact.contact_name.split(' ').slice(1).join(' ') : '',
      phone: contact.phone_number,
      email: ''
    });
  };
  
  const handleCreateNewContact = async () => {
    if (!selectedContact) return;
    
    try {
      // Create new contact
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .insert({
          first_name: newContact.firstName,
          last_name: newContact.lastName,
          phone: selectedContact.phone_number,
          email: newContact.email || null
        })
        .select();
        
      if (contactError) throw contactError;
      
      if (!contactData || contactData.length === 0) throw new Error('Failed to create contact');
      
      // Update phone contact mapping
      await updateContactMapping(selectedContact.id, contactData[0].id);
      
      toast({
        title: "Contact created",
        description: "Contact created and linked successfully"
      });
      
      // Remove this contact from the list
      setPhoneContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setSelectedContact(null);
    } catch (error: any) {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create contact",
        variant: "destructive"
      });
    }
  };
  
  const handleLinkToExistingContact = async (contactId: string) => {
    if (!selectedContact) return;
    
    try {
      await updateContactMapping(selectedContact.id, contactId);
      
      toast({
        title: "Contact linked",
        description: "Phone number linked to existing contact successfully"
      });
      
      // Remove this contact from the list
      setPhoneContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      setSelectedContact(null);
    } catch (error: any) {
      console.error('Error linking contact:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to link contact",
        variant: "destructive"
      });
    }
  };
  
  const updateContactMapping = async (mappingId: string, contactId: string) => {
    const { error } = await supabase
      .from('phone_contact_mappings')
      .update({ contact_id: contactId })
      .eq('id', mappingId);
      
    if (error) throw error;
    
    // Update communications with this contact_phone to use the new contact_id
    const { error: commError } = await supabase
      .from('communications')
      .update({ contact_id: contactId })
      .eq('contact_phone', selectedContact?.phone_number);
      
    if (commError) {
      console.error('Error updating communications:', commError);
      // Don't throw here - we've already updated the mapping
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Settings
          </Button>
          <h1 className="text-2xl font-bold">Resolve Contacts</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Unmatched Phone Numbers
              </CardTitle>
              <CardDescription>
                These phone numbers need to be linked to contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : phoneContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>All phone numbers have been resolved!</p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phone</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>#</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phoneContacts.map(contact => (
                        <TableRow 
                          key={contact.id}
                          className={selectedContact?.id === contact.id ? 'bg-muted' : 'cursor-pointer hover:bg-muted/50'}
                          onClick={() => handleSelectPhoneContact(contact)}
                        >
                          <TableCell className="font-mono">{contact.phone_number}</TableCell>
                          <TableCell>{contact.contact_name || 'Unknown'}</TableCell>
                          <TableCell>{contact.message_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedContact ? (
            <Card>
              <CardHeader>
                <CardTitle>Resolve: {selectedContact.contact_name || selectedContact.phone_number}</CardTitle>
                <CardDescription>
                  Resolve this number by creating a new contact or linking to an existing one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTitle>Preview</AlertTitle>
                  <AlertDescription className="text-sm">
                    <div><strong>Phone:</strong> {selectedContact.phone_number}</div>
                    <div><strong>Name from import:</strong> {selectedContact.contact_name || 'Not available'}</div>
                    <div><strong>Message count:</strong> {selectedContact.message_count}</div>
                    <div><strong>Sample message:</strong> {selectedContact.message_preview}</div>
                  </AlertDescription>
                </Alert>
                
                <Tabs defaultValue="create">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Create New Contact
                    </TabsTrigger>
                    <TabsTrigger value="link" className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" /> Link to Existing
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName"
                          placeholder="First name"
                          value={newContact.firstName}
                          onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName"
                          placeholder="Last name"
                          value={newContact.lastName}
                          onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="Phone number" 
                        disabled
                        value={selectedContact.phone_number}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input 
                        id="email" 
                        placeholder="Email address" 
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="link" className="pt-4">
                    <div className="space-y-4">
                      <Label>Select an existing contact</Label>
                      {isContactsLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : contacts.length === 0 ? (
                        <p className="text-muted-foreground">No existing contacts found</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email/Phone</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contacts.map(contact => (
                              <TableRow key={contact.id}>
                                <TableCell>
                                  {contact.first_name} {contact.last_name}
                                </TableCell>
                                <TableCell>
                                  <div>{contact.email}</div>
                                  <div className="text-muted-foreground text-sm">{contact.phone}</div>
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleLinkToExistingContact(contact.id)}
                                  >
                                    Link
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedContact(null)}
                >
                  Cancel
                </Button>
                
                <Button 
                  onClick={handleCreateNewContact} 
                  disabled={!newContact.firstName || !newContact.lastName}
                >
                  Create & Link Contact
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center py-16">
              <div className="text-center space-y-4">
                <User className="h-12 w-12 mx-auto text-muted-foreground" />
                <CardTitle>Select a phone number to resolve</CardTitle>
                <CardDescription className="max-w-sm">
                  Choose an unmatched phone number from the list to create a new contact or link to an existing one.
                </CardDescription>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/settings')}
        >
          Back to Settings
        </Button>
        
        <div className="text-right">
          <span className="text-muted-foreground mr-2">
            {phoneContacts.length} unresolved contacts
          </span>
          {phoneContacts.length === 0 && (
            <Button onClick={() => navigate('/communications')}>
              View Communications
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
