
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAssistant } from '@/components/ai/AIAssistant';
import { LightbulbIcon, PencilRuler, ArrowUpRight, LineChart } from 'lucide-react';

export function AIInsights() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <LightbulbIcon className="mr-2 h-5 w-5 text-yellow-500" />
          AI Insights & Assistance
        </CardTitle>
        <CardDescription>
          Leverage AI to enhance your workflow and customer relationships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="email">Draft Email</TabsTrigger>
            <TabsTrigger value="relationships">Relationship Summary</TabsTrigger>
            <TabsTrigger value="deals">Deal Scoring</TabsTrigger>
            <TabsTrigger value="followup">Follow-up Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <AIAssistant
              title="AI Email Drafter"
              description="Generate professional emails based on your context or requirements"
              action="draft_email"
              placeholder="Describe what kind of email you want to draft. For example: 'Write a follow-up email to John about our meeting on Tuesday regarding the enterprise software proposal.'"
            />
          </TabsContent>
          
          <TabsContent value="relationships">
            <AIAssistant
              title="Relationship Summarizer"
              description="Get insights and summaries of your business relationships"
              action="summarize_relationship"
              placeholder="Provide details about the relationship you want to analyze. For example: 'Our company has been working with Acme Inc. for 2 years. We've had 3 successful projects. The main point of contact is Sarah Johnson.'"
            />
          </TabsContent>
          
          <TabsContent value="deals">
            <AIAssistant
              title="Deal Health Scoring"
              description="Get an AI assessment of your deal's health and potential"
              action="score_deal"
              placeholder="Enter the details of your deal for scoring. Include information like deal value, stage, last contact date, prospect engagement level, and any concerns."
            />
          </TabsContent>
          
          <TabsContent value="followup">
            <AIAssistant
              title="Follow-up Recommendations"
              description="Get AI suggestions for your next steps with contacts and deals"
              action="suggest_followup"
              placeholder="Provide context about the contact or deal you need follow-up suggestions for. Include information about past interactions, current status, and any specific goals."
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
