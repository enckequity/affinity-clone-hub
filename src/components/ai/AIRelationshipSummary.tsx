
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { Loader2, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIRelationshipSummaryProps {
  entityType: 'contact' | 'company' | 'deal';
  entityData: any;
  interactionHistory?: string;
}

export function AIRelationshipSummary({ 
  entityType, 
  entityData,
  interactionHistory = ''
}: AIRelationshipSummaryProps) {
  const { executeAIAction, isLoading, result } = useAIAssistant();
  const { toast } = useToast();
  const [riskScore, setRiskScore] = useState<string | null>(null);

  const generateSummary = async () => {
    try {
      // Generate contextual content for the AI
      let content = '';
      
      if (entityType === 'contact') {
        content = `Contact: ${entityData.first_name} ${entityData.last_name} from ${entityData.company || 'Unknown company'}. `;
        content += entityData.job_title ? `Role: ${entityData.job_title}. ` : '';
        content += entityData.notes ? `Notes: ${entityData.notes}. ` : '';
      } else if (entityType === 'company') {
        content = `Company: ${entityData.name}. `;
        content += entityData.industry ? `Industry: ${entityData.industry}. ` : '';
        content += entityData.size ? `Size: ${entityData.size}. ` : '';
        content += entityData.description ? `Description: ${entityData.description}. ` : '';
      } else if (entityType === 'deal') {
        content = `Deal: ${entityData.name} with ${entityData.company || 'Unknown company'}. `;
        content += `Stage: ${entityData.stageLabel}. `;
        content += `Value: $${entityData.value?.toLocaleString() || 'Unknown'}. `;
        content += entityData.expectedCloseDate ? `Expected close: ${new Date(entityData.expectedCloseDate).toLocaleDateString()}. ` : '';
      }
      
      // Add interaction history if available
      if (interactionHistory) {
        content += `\n\nInteraction History: ${interactionHistory}`;
      }
      
      await executeAIAction('summarize_relationship', content, entityData);
    } catch (error) {
      console.error('Failed to generate relationship summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate relationship summary',
        variant: 'destructive',
      });
    }
  };

  const analyzeRisk = async () => {
    try {
      // Generate contextual content for risk analysis
      let content = '';
      
      if (entityType === 'contact') {
        content = `Contact: ${entityData.first_name} ${entityData.last_name} from ${entityData.company || 'Unknown company'}. `;
        content += entityData.job_title ? `Role: ${entityData.job_title}. ` : '';
      } else if (entityType === 'company') {
        content = `Company: ${entityData.name}. `;
        content += entityData.industry ? `Industry: ${entityData.industry}. ` : '';
      } else if (entityType === 'deal') {
        content = `Deal: ${entityData.name} with ${entityData.company || 'Unknown company'}. `;
        content += `Stage: ${entityData.stageLabel}. `;
        content += `Value: $${entityData.value?.toLocaleString() || 'Unknown'}. `;
        content += entityData.expectedCloseDate ? `Expected close: ${new Date(entityData.expectedCloseDate).toLocaleDateString()}. ` : '';
        content += entityData.probability ? `Probability: ${entityData.probability}%. ` : '';
      }
      
      // Add interaction history if available
      if (interactionHistory) {
        content += `\n\nInteraction History: ${interactionHistory}`;
      }
      
      const riskResult = await executeAIAction('analyze_risk', content, entityData);
      
      // Extract risk score from the result
      const riskMatch = riskResult.match(/Risk Score:?\s*(Low|Medium|High)/i);
      if (riskMatch && riskMatch[1]) {
        setRiskScore(riskMatch[1].toLowerCase());
      }
    } catch (error) {
      console.error('Failed to analyze risk:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze risk',
        variant: 'destructive',
      });
    }
  };

  let entityTitle = '';
  if (entityType === 'contact') entityTitle = 'Contact';
  if (entityType === 'company') entityTitle = 'Company';
  if (entityType === 'deal') entityTitle = 'Deal';

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Relationship Insights
        </CardTitle>
        <CardDescription>AI-powered analysis of your {entityType} relationship</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateSummary} 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              Generate Summary
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={analyzeRisk} 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-3.5 w-3.5" />
              )}
              Analyze Risk
            </Button>
          </div>

          {riskScore && (
            <div className={`text-xs px-2 py-1 rounded-full w-fit font-medium ${
              riskScore === 'low' ? 'bg-green-100 text-green-800' : 
              riskScore === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {riskScore.charAt(0).toUpperCase() + riskScore.slice(1)} Risk
            </div>
          )}

          {result ? (
            <div className="rounded-md border p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Click 'Generate Summary' to get AI-powered insights for this {entityType}.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
