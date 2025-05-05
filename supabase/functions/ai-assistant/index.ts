
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
    const { action, content } = await req.json();
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    let response;
    
    switch (action) {
      case 'draft_email':
        prompt = `Draft a professional email for the following context: ${content}`;
        break;
      case 'summarize_relationship':
        prompt = `Summarize the following business relationship and provide key insights: ${content}`;
        break;
      case 'score_deal':
        prompt = `Based on the following deal details, provide a score from 1-100 and explain the reasoning: ${content}`;
        break;
      case 'suggest_followup':
        prompt = `Suggest follow-up actions based on this interaction history: ${content}`;
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
            content: 'You are an AI assistant for a CRM system. Provide concise, practical, and professional responses.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
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
