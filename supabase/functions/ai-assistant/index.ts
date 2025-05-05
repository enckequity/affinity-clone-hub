
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, entityData } = await req.json();
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    let systemPrompt = 'You are an AI assistant for a CRM system. Provide concise, practical, and professional responses.';
    let response;
    
    switch (action) {
      case 'draft_email':
        prompt = `Draft a professional email for the following context: ${content}`;
        break;
      case 'summarize_relationship':
        systemPrompt = 'You are an AI relationship analyst for a CRM system. Analyze relationship data and provide insightful, actionable summaries.';
        prompt = `Based on the following interaction history and relationship data, provide a concise summary of the relationship status, key insights, and potential opportunities:\n\n${content}`;
        if (entityData) {
          prompt += `\n\nEntity Details: ${JSON.stringify(entityData)}`;
        }
        break;
      case 'score_deal':
        systemPrompt = 'You are an AI deal analyst for a CRM system. Score deals based on provided information and explain your reasoning.';
        prompt = `Based on the following deal details, provide a score from 1-100 and explain the reasoning. Consider factors like engagement level, timeline, communication frequency, and stakeholder involvement:\n\n${content}`;
        break;
      case 'suggest_followup':
        systemPrompt = 'You are an AI assistant for a CRM system. Suggest strategic follow-up actions based on relationship history.';
        prompt = `Suggest specific follow-up actions based on this interaction history. Focus on timing, approach, and content that would strengthen the relationship and advance opportunities:\n\n${content}`;
        break;
      case 'analyze_risk':
        systemPrompt = 'You are an AI risk analyst for a CRM system. Identify relationship and deal risks based on provided data.';
        prompt = `Analyze the following data and identify any risks to this relationship or deal. Provide a risk score (Low, Medium, High) with specific concerns and mitigation suggestions:\n\n${content}`;
        if (entityData) {
          prompt += `\n\nEntity Details: ${JSON.stringify(entityData)}`;
        }
        break;
      case 'analyze_contact_risk':
        systemPrompt = 'You are an AI risk analyst for a CRM system. Identify contact relationship risks based on provided data.';
        prompt = `Analyze the following data about this contact and identify any risks to the relationship. Look for inactivity periods, missed follow-ups, negative sentiment, and other risk factors. Provide a risk score (Low, Medium, High) with specific concerns and mitigation suggestions:\n\n${content}`;
        if (entityData) {
          prompt += `\n\nContact Details: ${JSON.stringify(entityData)}`;
        }
        break;
      case 'detect_duplicates':
        systemPrompt = 'You are an AI data hygiene assistant for a CRM system. Analyze data for potential duplicates.';
        prompt = `Analyze the following data and identify any potential duplicate records. Explain your reasoning and confidence level for each potential match:\n\n${content}`;
        if (entityData) {
          prompt += `\n\nData Records: ${JSON.stringify(entityData)}`;
        }
        break;
      case 'enrich_data':
        systemPrompt = 'You are an AI data enrichment assistant for a CRM system. Suggest data improvements based on available information.';
        prompt = `Based on the following contact or company information, suggest missing data fields that could be enriched, and where possible, suggest potential values based on available data:\n\n${content}`;
        if (entityData) {
          prompt += `\n\nEntity Details: ${JSON.stringify(entityData)}`;
        }
        break;
      case 'natural_language_query':
        systemPrompt = 'You are an AI assistant for a CRM system. Interpret natural language queries about CRM data and provide helpful responses. Format your response as though you are presenting data from a real CRM. Use bullet points, lists, and clear sections to make your response easy to read and actionable.';
        prompt = `Based on the following CRM query and the available data, provide a helpful response: ${content}\n\nAvailable Data: ${JSON.stringify(entityData || {})}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Call OpenAI API
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'OpenAI API error');
    }

    return new Response(
      JSON.stringify({ 
        result: data.choices[0].message.content,
        action
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in AI assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
