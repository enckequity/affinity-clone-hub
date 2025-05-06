
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
    const { transcript, entities } = await req.json();
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: 'No transcript provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Received transcript for parsing");
    
    // Build the prompt with available entities
    let systemPrompt = `You are a helpful assistant that parses voice notes about multiple customers into separate notes for each customer mentioned. 
    Extract notes for each company or contact mentioned. Format your response as a JSON array where each object contains:
    - entityName: The name of the company or contact this note is about (must be an exact match to one of the provided names)
    - entityType: Either "company" or "contact"
    - entityId: The ID of the entity (must be an exact match from the provided list)
    - content: The content of the note about this specific entity, formatted clearly
    
    Available entities:`;
    
    if (entities && entities.companies) {
      systemPrompt += "\nCompanies:";
      entities.companies.forEach((company: any) => {
        systemPrompt += `\n- Name: "${company.name}", ID: "${company.id}"`;
      });
    }
    
    if (entities && entities.contacts) {
      systemPrompt += "\nContacts:";
      entities.contacts.forEach((contact: any) => {
        systemPrompt += `\n- Name: "${contact.first_name} ${contact.last_name}", ID: "${contact.id}"`;
      });
    }
    
    systemPrompt += `\n\nIf a part of the transcript doesn't clearly relate to any entity, do not include it in the output.
    If no entities are identified in the transcript, return an empty array.
    Output format must be a valid JSON array that can be parsed with JSON.parse().`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this transcript into separate notes for each customer mentioned:\n\n${transcript}` }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error.message || 'OpenAI API error');
    }

    // Extract and parse the JSON response
    let parsedNotes;
    try {
      const aiResponse = data.choices[0].message.content;
      console.log("AI response:", aiResponse);
      
      // Try to extract JSON if it's wrapped in backticks
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                         aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                         aiResponse.match(/\[([\s\S]*?)\]/);
                         
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      parsedNotes = JSON.parse(jsonString);
      console.log("Successfully parsed notes:", parsedNotes.length);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response', 
          aiResponse: data.choices[0].message.content 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ notes: parsedNotes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parse-notes function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
