
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommunications } from '@/hooks/use-communications';
import { useContacts } from '@/hooks/use-contacts';
import { Phone, Search, UserCircle, RefreshCw } from "lucide-react";

export function ContactMappings() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    contactMappings,
    isLoadingContactMappings,
    updateContactMapping
  } = useCommunications();
  
  const {
    contacts
  } = useContacts();
  
  // Filter contact mappings based on search query
  const filteredMappings = contactMappings.filter(mapping => {
    const searchLower = searchQuery.toLowerCase();
    return (
      mapping.phone_number.toLowerCase().includes(searchLower) ||
      (mapping.contact_name && mapping.contact_name.toLowerCase().includes(searchLower)) ||
      (mapping.contacts?.first_name && mapping.contacts.first_name.toLowerCase().includes(searchLower)) ||
      (mapping.contacts?.last_name && mapping.contacts.last_name.toLowerCase().includes(searchLower))
    );
  });
  
  const handleContactChange = (mappingId: string, contactId: string) => {
    updateContactMapping.mutate({ id: mappingId, contactId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Mappings</CardTitle>
        <CardDescription>
          Map phone contacts to your CRM contacts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or phone..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoadingContactMappings ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMappings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Phone className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-lg font-medium">No phone contacts found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Phone contacts will appear here after your first sync
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Contact</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>CRM Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{mapping.contact_name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {mapping.phone_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.contact_id || ''}
                      onValueChange={(value) => handleContactChange(mapping.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a contact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Not mapped</SelectItem>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
