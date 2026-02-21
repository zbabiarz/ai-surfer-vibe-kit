import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from 'npm:openai@4.28.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  purpose: string;
}

const SYSTEM_PROMPT = `You are a creative app naming expert. Your job is to generate catchy, trendy, memorable app names based on what the app does.

IMPORTANT RULES:
1. Generate SHORT, catchy names (1-3 words max)
2. Make them trendy and modern
3. Names should be relevant to the app's purpose
4. Use creative wordplay, portmanteaus, or clever combinations
5. Make them memorable and easy to pronounce
6. Consider modern naming trends (ending in -ly, -fy, -hub, -spot, etc.)

Examples of good app names:
- Slack (communication)
- Notion (productivity)
- Duolingo (language learning)
- Headspace (meditation)
- Calendly (scheduling)

Respond with ONLY the app name, nothing else. No explanations, no quotes, just the name.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json() as RequestBody;

    if (!body.purpose || body.purpose.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Purpose is required' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 400,
        }
      );
    }

    const apiKey = Deno.env.get('VITE_OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const openaiClient = new OpenAI({
      apiKey: apiKey.trim(),
    });

    const userMessage = `Generate a catchy, trendy app name for an app that: ${body.purpose}`;

    console.log('Calling OpenAI to generate app name...');

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.9,
      max_tokens: 50,
    });

    console.log('Response received from OpenAI');

    const appName = completion.choices[0]?.message?.content?.trim();

    if (!appName) {
      throw new Error('No name generated from OpenAI');
    }

    console.log('App name generated successfully:', appName);

    return new Response(
      JSON.stringify({ name: appName }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-app-name function:', error);

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
