
import React, { useState, useEffect } from 'react';
import { ConversationList } from '@/components/communications/ConversationList';
import { MessageThread } from '@/components/communications/MessageThread';
import { useCommunications } from '@/hooks/use-communications';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Communications = () => {
  const { 
    communications, 
    contactMappings, 
    isLoadingCommunications, 
    isLoadingContactMappings,
    searchQuery,
    setSearchQuery,
  } = useCommunications();
  
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  
  // Process communications to get a list of contacts with their latest messages
  const contacts = React.useMemo(() => {
    if (!communications || !contactMappings) return [];
    
    // Group communications by contact phone
    const communicationsByPhone: Record<string, any[]> = {};
    communications.forEach(comm => {
      if (!communicationsByPhone[comm.contact_phone]) {
        communicationsByPhone[comm.contact_phone] = [];
      }
      communicationsByPhone[comm.contact_phone].push(comm);
    });
    
    // Create contact objects with last message info
    return Object.entries(communicationsByPhone).map(([phone, comms]) => {
      // Find matching contact mapping
      const mapping = contactMappings.find(m => m.phone_number === phone);
      const sortedComms = [...comms].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const lastMessage = sortedComms[0];
      const unreadCount = comms.filter(c => !c.read).length;
      
      return {
        id: mapping?.id || phone,
        phone,
        name: mapping?.contact_name || phone,
        lastMessage: lastMessage?.content || 'No message content',
        lastMessageTime: lastMessage?.timestamp,
        unreadCount,
      };
    }).filter(contact => {
      if (!searchQuery) return true;
      return (
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        contact.phone.includes(searchQuery) ||
        contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }).sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });
  }, [communications, contactMappings, searchQuery]);
  
  // Get messages for selected contact
  const selectedContactMessages = React.useMemo(() => {
    if (!selectedContactId || !communications) return [];
    
    // If selected by mapping ID
    const mapping = contactMappings?.find(m => m.id === selectedContactId);
    const phone = mapping?.phone_number || selectedContactId;
    
    // Filter communications by phone number
    return communications
      .filter(comm => comm.contact_phone === phone && comm.type === 'text')
      .map(comm => ({
        id: comm.id,
        content: comm.content || '',
        timestamp: comm.timestamp,
        direction: comm.direction as 'incoming' | 'outgoing',
        read: comm.read
      }));
  }, [selectedContactId, communications, contactMappings]);
  
  // Get contact name for the selected contact
  const selectedContactName = React.useMemo(() => {
    if (!selectedContactId) return '';
    const contact = contacts.find(c => c.id === selectedContactId);
    return contact?.name || '';
  }, [selectedContactId, contacts]);
  
  // Auto-select first contact when data loads
  useEffect(() => {
    if (contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);
  
  // Handle send message (would integrate with actual messaging service if available)
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContactId) return;
    
    console.log('Sending message:', messageText, 'to contact:', selectedContactId);
    // In a real app, this would send the message through an API
    // For now, we just clear the input
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Show loading state
  if (isLoadingCommunications || isLoadingContactMappings) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">View and manage your imported message history</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left sidebar - Contact list */}
        <div className="md:col-span-1 border rounded-lg shadow-sm overflow-hidden bg-white">
          <ConversationList
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={setSelectedContactId}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
          />
        </div>
        
        {/* Right side - Message thread */}
        <div className="md:col-span-2 border rounded-lg shadow-sm overflow-hidden bg-white flex flex-col">
          {selectedContactId ? (
            <>
              {/* Contact header */}
              <div className="p-4 border-b flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                  {selectedContactName ? selectedContactName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h2 className="font-medium">{selectedContactName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {contacts.find(c => c.id === selectedContactId)?.phone || ''}
                  </p>
                </div>
              </div>
              
              {/* Message thread */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                <MessageThread 
                  messages={selectedContactMessages}
                  contactName={selectedContactName}
                />
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  This is a read-only view of your imported messages. 
                  Sending new messages is not yet supported.
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
              <p className="mb-2">Select a conversation</p>
              <p className="text-xs">Choose a contact from the list to view your message history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communications;
