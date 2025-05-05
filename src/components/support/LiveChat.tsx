
import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Send, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Message = {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

export function LiveChat({ open, onOpenChange }: LiveChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm your AI support assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponses = [
        "I'll help you with that! Let me find the information you need.",
        "Great question. Based on our documentation, you can solve this by going to Settings and updating your preferences.",
        "I understand your concern. This is a known issue that our team is working on. For now, you can try this workaround...",
        "I'd be happy to help you with that. Can you please provide more details about what you're trying to accomplish?",
        "Thanks for your question. The feature you're looking for can be found under the 'Advanced' section in your dashboard."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: messages.length + 2,
        sender: 'ai',
        text: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Support Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}
            >
              {msg.sender === 'ai' && (
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              placeholder="Type your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
