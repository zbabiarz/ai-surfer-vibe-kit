import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from 'npm:openai@4.28.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  userResponses?: string;
  mode: 'instant' | 'conversational';
}

const SYSTEM_PROMPT = `You are a creative app idea generator. Your job is to help people who are stuck and don't know what to build by generating simple, achievable app ideas that are perfect for no-code platforms like Bolt.new.

IMPORTANT RULES:
1. Generate SIMPLE ideas that can be built quickly
2. Focus on practical, useful applications
3. Ideas should be achievable for beginners
4. NEVER suggest image generation or complex AI features
5. Use placeholder images from Unsplash for any visual needs
6. Ideas should be clear and specific

When generating an idea, provide:
- A catchy, clear app name
- A concise purpose (1-2 sentences)
- Target audience
- 3-5 main features (simple, bullet-point style)
- Brief design notes
- Simple monetization strategy

Format your response as JSON with these exact fields:
{
  "name": "App Name Here",
  "purpose": "Clear description of what the app does",
  "target_audience": "Who will use this app",
  "main_features": "Feature 1\\nFeature 2\\nFeature 3",
  "design_notes": "Brief design guidance",
  "monetization": "How it could make money"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json() as RequestBody;

    const apiKey = Deno.env.get('VITE_OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const openaiClient = new OpenAI({
      apiKey: apiKey.trim(),
    });

    let userMessage = '';

    if (body.mode === 'conversational' && body.userResponses) {
      userMessage = `Based on these user responses, generate a personalized app idea that matches their interests and needs:\n\n${body.userResponses}\n\nProvide a simple, achievable app idea in the specified JSON format.`;
    } else {
      userMessage = 'Generate a random simple app idea that would be fun or useful to build. Make it creative but achievable for beginners. Provide it in the specified JSON format.';
    }

    console.log('Calling OpenAI to generate idea...');

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    console.log('Response received from OpenAI');

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response generated from OpenAI');
    }

    const idea = JSON.parse(responseContent);

    // Validate the response has all required fields
    const requiredFields = ['name', 'purpose', 'target_audience', 'main_features', 'design_notes', 'monetization'];
    for (const field of requiredFields) {
      if (!idea[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    console.log('Idea generated successfully');

    return new Response(
      JSON.stringify({ idea }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-idea function:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.message?.includes('API key')) {
      errorMessage = 'OpenAI API key is invalid or not configured.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'OpenAI API quota exceeded.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid OpenAI API key.';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error.message || String(error),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
