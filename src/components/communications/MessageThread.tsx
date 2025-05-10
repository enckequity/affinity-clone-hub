
import React from 'react';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing' | 'missed' | 'unknown';
  read?: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  contactName?: string;
}

export function MessageThread({ messages, contactName }: MessageThreadProps) {
  // Sort messages by timestamp
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Group messages by date for separators
  const messagesByDate: { [date: string]: Message[] } = {};
  
  sortedMessages.forEach(message => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-lg p-4 overflow-y-auto">
      <div className="flex-grow space-y-4">
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <div key={date} className="space-y-2">
            <div className="flex justify-center">
              <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {format(new Date(date), 'MMMM d, yyyy')}
              </div>
            </div>
            
            {dateMessages.map(message => (
              <div 
                key={message.id}
                className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    message.direction === 'outgoing' 
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                  <div className={`text-xs mt-1 text-right ${
                    message.direction === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
            <p className="mb-2">No messages yet</p>
            <p className="text-xs">Import your message history to see conversations here</p>
          </div>
        )}
      </div>
    </div>
  );
}
