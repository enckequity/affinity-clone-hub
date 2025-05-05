
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { Loader2, Sparkles, Send, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantProps {
  title: string;
  description: string;
  action: 'draft_email' | 'summarize_relationship' | 'score_deal' | 'suggest_followup';
  placeholder: string;
  prefilledContent?: string;
}

export function AIAssistant({ 
  title, 
  description, 
  action, 
  placeholder,
  prefilledContent = ''
}: AIAssistantProps) {
  const [content, setContent] = useState(prefilledContent);
  const { executeAIAction, isLoading, result } = useAIAssistant();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      await executeAIAction(action, content);
    } catch (error) {
      console.error('Failed to execute AI action:', error);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    
    navigator.clipboard.writeText(result)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          description: 'The AI generated content has been copied to your clipboard.',
        });
      })
      .catch((error) => {
        console.error('Failed to copy:', error);
        toast({
          title: 'Failed to copy',
          description: 'Could not copy the content to clipboard.',
          variant: 'destructive',
        });
      });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="resize-none"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !content.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">AI Generated Response</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                className="h-8"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy
              </Button>
            </div>
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
