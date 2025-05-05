
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NaturalLanguageSearch() {
  const [query, setQuery] = useState('');
  const { executeAIAction, isLoading, result } = useAIAssistant();
  const { toast } = useToast();
  
  // Example CRM data to pass to the AI function
  // In a real app, you'd fetch this from your state or context
  const mockCrmData = {
    dealsClosingThisMonth: [
      { name: 'Enterprise Solution', company: 'Acme Inc', value: 45000, expectedCloseDate: '2023-05-25' },
      { name: 'Security Upgrade', company: 'Tech Corp', value: 28000, expectedCloseDate: '2023-05-30' }
    ],
    dealsAtRisk: [
      { name: 'Software Renewal', company: 'Global Finance', risk: 'High', lastContact: '45 days ago' }
    ],
    recentContacts: [
      { name: 'Sarah Johnson', company: 'Acme Inc', lastContacted: '2 days ago' },
      { name: 'Mike Brown', company: 'Tech Corp', lastContacted: '5 days ago' }
    ]
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    try {
      await executeAIAction('natural_language_query', query, mockCrmData);
    } catch (error) {
      console.error('Failed to process natural language query:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your query',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleQuery} className="flex gap-2">
        <Input
          placeholder="Ask something like 'Show my deals closing this month' or 'Which contacts should I follow up with?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="mr-2 h-4 w-4" />
          )}
          Ask
        </Button>
      </form>
      
      {result && (
        <div className="rounded-md border p-4 bg-muted/20 text-sm whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
