
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { Loader2, MessageSquare, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from "@/components/ui/card";

export function NaturalLanguageSearch() {
  const [query, setQuery] = useState('');
  const [recentQueries, setRecentQueries] = useState<string[]>([
    'Show my deals closing this month',
    'Which contacts should I follow up with?',
    'Identify deals at risk'
  ]);
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
      
      // Add to recent queries if not already there
      if (!recentQueries.includes(query)) {
        setRecentQueries(prev => [query, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Failed to process natural language query:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your query',
        variant: 'destructive',
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleQuery(new Event('submit') as unknown as React.FormEvent);
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
      
      {!result && !isLoading && (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-2">Try asking:</h3>
            <div className="space-y-2">
              {recentQueries.map((suggestion, index) => (
                <Button 
                  key={index} 
                  variant="ghost" 
                  className="w-full justify-start h-auto py-2 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <ChevronRight className="h-3 w-3 mr-2" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <div className="rounded-md border p-4 bg-muted/20 text-sm whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
