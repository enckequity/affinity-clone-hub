
import React from 'react';
import { format } from 'date-fns';
import {
  Phone,
  MessageSquare,
  ArrowDownLeft,
  ArrowUpRight,
  Star,
  StarOff,
  Check,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCommunications } from '@/hooks/use-communications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ContactCommunicationsProps {
  contactId: string;
}

export function ContactCommunications({ contactId }: ContactCommunicationsProps) {
  const {
    communications,
    isLoadingCommunications,
    markAsRead,
    toggleImportance
  } = useCommunications();
  
  // Filter communications for this specific contact
  const contactCommunications = communications.filter(
    comm => comm.contact_id === contactId
  );
  
  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };
  
  const handleToggleImportance = (id: string, currentStatus: boolean) => {
    toggleImportance.mutate({ id, important: !currentStatus });
  };
  
  if (isLoadingCommunications) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (contactCommunications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex items-center justify-center rounded-full bg-muted w-12 h-12 mb-3">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No communications</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No call or message history has been synced for this contact yet.
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {contactCommunications.map((comm) => {
          const isCall = comm.type === 'call';
          const timestamp = new Date(comm.timestamp);
          
          return (
            <div
              key={comm.id}
              className={`border rounded-md p-3 ${!comm.read ? 'bg-muted/30 border-primary/20' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className={`rounded-full p-2 mr-3 ${isCall ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {isCall ? (
                      <Phone className={`h-4 w-4 ${comm.direction === 'missed' ? 'text-red-500' : 'text-blue-500'}`} />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {isCall ? 'Phone Call' : 'Text Message'}
                      </span>
                      <div className="flex items-center ml-2">
                        {comm.direction === 'incoming' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" />
                        ) : comm.direction === 'outgoing' ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </div>
                      {!comm.read && (
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/10">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(timestamp, 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {!comm.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(comm.id)}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleImportance(comm.id, comm.important)}
                    title={comm.important ? "Remove importance" : "Mark as important"}
                  >
                    {comm.important ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {isCall ? (
                <div className="text-sm">
                  <span className="font-medium mr-1">Duration:</span>
                  {comm.duration ? `${Math.floor(comm.duration / 60)}m ${comm.duration % 60}s` : 'N/A'}
                </div>
              ) : (
                comm.content && (
                  <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                    {comm.content}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
