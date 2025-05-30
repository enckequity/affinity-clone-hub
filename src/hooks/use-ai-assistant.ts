
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

type AIAction = 
  | 'draft_email' 
  | 'summarize_relationship' 
  | 'score_deal' 
  | 'suggest_followup'
  | 'analyze_risk'
  | 'natural_language_query'
  | 'analyze_contact_risk'
  | 'detect_duplicates'
  | 'enrich_data';

interface UseAIAssistantOptions {
  onSuccess?: (result: string) => void;
  onError?: (error: Error) => void;
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const executeAIAction = async (action: AIAction, content: string, entityData: any = null) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { action, content, entityData },
      });

      if (error) {
        throw new Error(error.message || 'Failed to execute AI action');
      }

      setResult(data.result);
      
      if (options.onSuccess) {
        options.onSuccess(data.result);
      }
      
      return data.result;
    } catch (err: any) {
      console.error('AI Assistant error:', err);
      
      const errorMessage = err.message || 'An error occurred while processing your request';
      setError(new Error(errorMessage));
      
      toast({
        title: 'AI Assistant Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      if (options.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeAIAction,
    draftEmail: (content: string) => executeAIAction('draft_email', content),
    summarizeRelationship: (content: string, entityData = null) => executeAIAction('summarize_relationship', content, entityData),
    scoreDeal: (content: string) => executeAIAction('score_deal', content),
    suggestFollowup: (content: string) => executeAIAction('suggest_followup', content),
    analyzeRisk: (content: string, entityData = null) => executeAIAction('analyze_risk', content, entityData),
    analyzeContactRisk: (content: string, entityData = null) => executeAIAction('analyze_contact_risk', content, entityData),
    detectDuplicates: (content: string, entityData = null) => executeAIAction('detect_duplicates', content, entityData),
    enrichData: (content: string, entityData = null) => executeAIAction('enrich_data', content, entityData),
    queryNaturalLanguage: (content: string, entityData = null) => executeAIAction('natural_language_query', content, entityData),
    isLoading,
    result,
    error,
  };
}
