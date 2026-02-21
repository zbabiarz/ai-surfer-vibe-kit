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

interface ScoreDetail {
  score: number;
  reason: string;
}

interface Competitor {
  name: string;
  url: string;
  pricing: string;
  weakness: string;
}

interface ValidationResult {
  overallScore: number;
  verdict: "GO" | "MAYBE" | "PIVOT";
  scores: {
    marketNeed: ScoreDetail;
    competition: ScoreDetail;
    monetization: ScoreDetail;
    feasibility: ScoreDetail;
  };
  competitors: Competitor[];
  redditSignals: string[];
  yourEdge: string;
  biggestRisk: string;
  pivotSuggestions: string[];
  quickWin: string;
}

const SYSTEM_PROMPT = `You are a ruthlessly honest startup analyst and market researcher. Your job is to validate app ideas before founders waste time building something nobody wants.

Analyze the provided app idea and return a JSON scorecard. Be specific, cite real competitors, and give actionable feedback.

CONSISTENCY REQUIREMENT: You must apply the scoring criteria mechanically and deterministically. For identical inputs you must always produce identical scores. Do not vary your scores between runs. Commit to a score and do not second-guess it.

IMPORTANT SCORING GUIDELINES:
- marketNeed (1-10): How badly do people need this? Look for evidence of existing demand, pain points being discussed online, and whether people are actively searching for solutions.
- competition (1-10): Higher score = BETTER for the founder. 10 means blue ocean with no competitors, 1 means saturated market with dominant players. Consider market saturation and barriers to entry.
- monetization (1-10): How viable is the revenue model? Consider willingness to pay, pricing power, and recurring revenue potential.
- feasibility (1-10): Can a solo developer or small team build this with no-code/low-code tools? Consider technical complexity and time to MVP.

overallScore calculation: You MUST compute this exactly: (marketNeed * 0.30) + (competition * 0.20) + (monetization * 0.30) + (feasibility * 0.20), then multiply by 10 and round to the nearest integer. Do not estimate or approximate this value — calculate it precisely from the four sub-scores you assign.

verdict rules:
- "GO" if overallScore >= 70
- "MAYBE" if overallScore >= 50 and < 70
- "PIVOT" if overallScore < 50

For competitors: List 2-4 REAL companies that exist today. Include their actual website URLs, approximate pricing, and a genuine weakness the new app could exploit.

For redditSignals: Paraphrase 3-5 realistic pain points that people commonly express about this problem space. Make them sound like real user complaints.

For yourEdge: Write 2-3 sentences about what unique angle this specific app idea could take to differentiate.

For biggestRisk: Be honest about the #1 thing that could make this fail.

For pivotSuggestions: Only include these if overallScore < 60. Suggest 2-3 alternative directions that might be more viable.

For quickWin: Give ONE specific, actionable next step the founder should take immediately.

Return ONLY valid JSON matching this exact structure:
{
  "overallScore": number,
  "verdict": "GO" | "MAYBE" | "PIVOT",
  "scores": {
    "marketNeed": { "score": number, "reason": string },
    "competition": { "score": number, "reason": string },
    "monetization": { "score": number, "reason": string },
    "feasibility": { "score": number, "reason": string }
  },
  "competitors": [{ "name": string, "url": string, "pricing": string, "weakness": string }],
  "redditSignals": [string],
  "yourEdge": string,
  "biggestRisk": string,
  "pivotSuggestions": [string],
  "quickWin": string
}`;

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

    const userMessage = `Validate this app idea:

App Name: ${body.name || "Untitled App"}

Purpose/Description: ${body.purpose || "Not specified"}

Target Audience: ${body.target_audience || "Not specified"}

Main Features:
${body.main_features ? body.main_features.split("\n").filter((f: string) => f.trim()).map((f: string) => `- ${f.trim()}`).join("\n") : "- Not specified"}

Design Notes:
${body.design_notes ? body.design_notes.split("\n").filter((f: string) => f.trim()).map((f: string) => `- ${f.trim()}`).join("\n") : "- Not specified"}

Monetization Strategy:
${body.monetization || "Not specified"}

Provide a thorough, honest analysis. Be specific with competitor names and realistic with pain points.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0,
      seed: 42,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response generated from OpenAI" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const validation: ValidationResult = JSON.parse(content);

    return new Response(
      JSON.stringify(validation),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in validate-idea function:", error);

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
    } else if (message.includes("JSON")) {
      errorMessage = "Failed to parse validation response. Please try again.";
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
