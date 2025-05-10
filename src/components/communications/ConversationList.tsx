
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface ConversationListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function ConversationList({
  contacts,
  selectedContactId,
  onSelectContact,
  onSearch,
  searchQuery
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {contacts.length > 0 ? (
          <div className="divide-y">
            {contacts.map((contact) => (
              <Button
                key={contact.id}
                variant="ghost"
                className={`w-full justify-start px-4 py-3 h-auto ${
                  selectedContactId === contact.id ? 'bg-muted' : ''
                }`}
                onClick={() => onSelectContact(contact.id)}
              >
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  </div>
                  
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium truncate">
                        {contact.name || contact.phone}
                      </p>
                      {contact.lastMessageTime && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(contact.lastMessageTime), 'MMM d')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {contact.lastMessage || 'No messages'}
                      </p>
                      
                      {contact.unreadCount && contact.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center rounded-full bg-primary w-5 h-5 text-[10px] font-medium text-white">
                          {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <p className="mb-2">No conversations yet</p>
            <p className="text-xs">Import your message history to see your conversations</p>
          </div>
        )}
      </div>
    </div>
  );
}
