
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  try {
    const chunks: Uint8Array[] = [];
    let position = 0;
    
    while (position < base64String.length) {
      const chunk = base64String.slice(position, position + chunkSize);
      const binaryChunk = atob(chunk);
      const bytes = new Uint8Array(binaryChunk.length);
      
      for (let i = 0; i < binaryChunk.length; i++) {
        bytes[i] = binaryChunk.charCodeAt(i);
      }
      
      chunks.push(bytes);
      position += chunkSize;
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } catch (error) {
    console.error("Error processing base64 chunks:", error);
    throw new Error(`Failed to process audio data: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error("Missing OpenAI API key");
      throw new Error('OpenAI API key not configured')
    }

    const requestData = await req.json().catch(error => {
      console.error("Error parsing request JSON:", error);
      throw new Error('Invalid JSON in request body');
    });

    const { audio } = requestData;
    
    if (!audio) {
      console.error("No audio data provided in request");
      throw new Error('No audio data provided')
    }

    console.log("Processing audio data, length:", audio.length);

    if (audio.length < 100) {
      console.error("Audio data too short, possibly corrupted");
      throw new Error('Audio data too short or corrupted');
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    console.log("Sending request to OpenAI");

    // Send to OpenAI with improved error handling
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: formData,
    }).catch(error => {
      console.error("Network error calling OpenAI API:", error);
      throw new Error(`Network error: ${error.message}`);
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json().catch(error => {
      console.error("Error parsing OpenAI response:", error);
      throw new Error(`Failed to parse OpenAI response: ${error.message}`);
    });

    if (!result.text) {
      console.error("OpenAI response missing text field:", result);
      throw new Error('Invalid response from OpenAI API');
    }

    console.log("Transcription successful");

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in voice-to-text function:", error);
    
    // Provide a detailed error response
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack || 'No stack trace available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})
