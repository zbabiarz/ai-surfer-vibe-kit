import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.28.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  name: string;
  purpose: string;
  target_audience: string;
  main_features: string;
  design_notes: string;
  monetization: string;
}

const SYSTEM_PROMPT = `You are an expert prompt engineer for Bolt.new, a platform that creates full-stack web applications from prompts. Your job is to transform user's app ideas into comprehensive, detailed prompts that Bolt.new can use to generate complete applications.

CRITICAL RULES:
1. NEVER suggest image generation, logo creation, or any visual asset creation
2. ALWAYS specify to use placeholder images from Unsplash or similar free stock photo services
3. Focus on functionality, features, and user experience
4. Be specific about tech stack when relevant (React, TypeScript, Tailwind CSS, etc.)
5. Include details about layout, navigation, and user flows
6. Mention responsive design and modern UI practices

Output a single, comprehensive prompt that includes:
- Clear description of the application
- All major features and functionality
- User interface layout and navigation
- Data requirements and storage needs
- Any specific interactions or behaviors
- Placeholder solutions for any visual assets needed`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.name && !body.purpose) {
      return new Response(
        JSON.stringify({ error: "At least app name or purpose is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const apiKey = Deno.env.get("VITE_OPENAI_API_KEY");

    if (!apiKey) {
      console.error("VITE_OPENAI_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY as a Supabase secret." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const openaiClient = new OpenAI({ apiKey: apiKey.trim() });

    const userMessage = `Please create a comprehensive Bolt.new prompt for the following app idea:

App Name: ${body.name || "Untitled App"}

Purpose/Description: ${body.purpose || "Not specified"}

Target Audience: ${body.target_audience || "General users"}

Main Features:
${body.main_features ? body.main_features.split("\n").filter((f: string) => f.trim()).map((f: string) => `- ${f.trim()}`).join("\n") : "- Not specified"}

Design Notes:
${body.design_notes ? body.design_notes.split("\n").filter((f: string) => f.trim()).map((f: string) => `- ${f.trim()}`).join("\n") : "- Not specified"}

Monetization Strategy:
${body.monetization || "Not specified"}

Remember:
- DO NOT include any image generation requests
- Use Unsplash or placeholder images for any visual needs
- Focus on creating a functional, production-ready web application
- Be specific and comprehensive about all features and interactions`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const prompt = completion.choices[0]?.message?.content;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No response generated from OpenAI" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({ prompt }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-prompt function:", error);

    const message = error instanceof Error ? error.message : String(error);
    let errorMessage = "An unexpected error occurred";

    if (message.includes("API key")) {
      errorMessage = "OpenAI API key is invalid or not configured.";
    } else if (message.includes("quota")) {
      errorMessage = "OpenAI API quota exceeded. Please check your billing.";
    } else if ((error as any)?.status === 401) {
      errorMessage = "Invalid OpenAI API key.";
    } else if ((error as any)?.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again in a moment.";
    } else {
      errorMessage = message;
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});