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
  description: string;
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
  marketTrends: string[];
  searchInsights: string;
  yourEdge: string;
  biggestRisk: string;
  pivotSuggestions: string[];
  quickWin: string;
}

const SYSTEM_PROMPT = `You are a ruthlessly honest startup analyst and market researcher. Your job is to validate app ideas before founders waste time building something nobody wants.

You will be given LIVE WEB RESEARCH gathered specifically for this idea, followed by the app idea itself. Use the research to ground your analysis in real, current data.

CONSISTENCY REQUIREMENT: Apply scoring criteria mechanically and deterministically. For identical inputs always produce identical scores.

IMPORTANT SCORING GUIDELINES:
- marketNeed (1-10): How badly do people need this? Use the research to identify evidence of existing demand and pain points.
- competition (1-10): Higher score = BETTER for the founder. 10 means blue ocean, 1 means saturated with dominant players. Use the research to assess actual market saturation.
- monetization (1-10): How viable is the revenue model? Consider willingness to pay and pricing benchmarks from the research.
- feasibility (1-10): Can a solo developer or small team build this? Consider technical complexity and time to MVP.

overallScore calculation: Compute EXACTLY: (marketNeed * 0.30) + (competition * 0.20) + (monetization * 0.30) + (feasibility * 0.20), then multiply by 10 and round to nearest integer.

verdict rules:
- "GO" if overallScore >= 70
- "MAYBE" if overallScore >= 50 and < 70
- "PIVOT" if overallScore < 50

For competitors: Use the web research to identify 2-4 REAL companies. Include their actual website URLs, approximate pricing, a genuine weakness, and a one-sentence description of what they do.

For redditSignals: Extract 3-5 real pain points from the research about this problem space. These should be grounded in actual user complaints found in the research.

For marketTrends: Identify 2-3 current market trends relevant to this idea from the research. Format each as a concise bullet (1-2 sentences).

For searchInsights: Write 2-3 sentences summarizing the most important things the web research revealed that influenced your analysis.

For yourEdge: 2-3 sentences about what unique angle this app could take based on gaps identified in the research.

For biggestRisk: The #1 thing that could make this fail, informed by the research.

For pivotSuggestions: Only include if overallScore < 60. Suggest 2-3 alternative directions.

For quickWin: ONE specific, actionable next step the founder should take immediately.

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
  "competitors": [{ "name": string, "url": string, "pricing": string, "weakness": string, "description": string }],
  "redditSignals": [string],
  "marketTrends": [string],
  "searchInsights": string,
  "yourEdge": string,
  "biggestRisk": string,
  "pivotSuggestions": [string],
  "quickWin": string
}`;

async function runWebResearch(apiKey: string, appIdea: string): Promise<string> {
  const researchPrompt = `Research the following app idea and provide comprehensive market intelligence:

${appIdea}

Please search the web and find:
1. TOP COMPETITORS: What are the leading existing apps/tools solving this problem? Include their names, websites, approximate pricing, user reviews, and notable weaknesses.
2. COMMUNITY PAIN POINTS: What are real users complaining about with current solutions? Look for Reddit discussions, forums, and review sites.
3. MARKET TRENDS: What are the current market trends, growth signals, and industry direction for this space? Any recent news or funding activity?
4. PRICING BENCHMARKS: What do similar apps typically charge? What are users willing to pay?
5. MARKET SIZE: Any data on the market size or total addressable market for this category?

Be specific with names, URLs, and data points. This research will be used to validate the app idea.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-search-preview",
        web_search_options: {},
        messages: [
          { role: "user", content: researchPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Web research API error:", error);
      return "Web research unavailable. Proceeding with training data analysis.";
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content || "Web research returned no content.";
  } catch (err) {
    console.error("Web research fetch error:", err);
    return "Web research unavailable due to network error. Proceeding with training data analysis.";
  }
}

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

    const appIdeaSummary = `App Name: ${body.name || "Untitled App"}
Purpose: ${body.purpose || "Not specified"}
Target Audience: ${body.target_audience || "Not specified"}
Main Features: ${body.main_features || "Not specified"}
Monetization: ${body.monetization || "Not specified"}`;

    const webResearch = await runWebResearch(apiKey.trim(), appIdeaSummary);

    const openaiClient = new OpenAI({ apiKey: apiKey.trim() });

    const userMessage = `## LIVE WEB RESEARCH
The following research was gathered from the web specifically for this analysis. Use it to ground your scores and findings in real, current data:

${webResearch}

---

## APP IDEA TO VALIDATE

App Name: ${body.name || "Untitled App"}

Purpose/Description: ${body.purpose || "Not specified"}

Target Audience: ${body.target_audience || "Not specified"}

Main Features:
${body.main_features ? body.main_features.split("\n").filter((f: string) => f.trim()).map((f: string) => `- ${f.trim()}`).join("\n") : "- Not specified"}

Design Notes:
${body.design_notes ? body.design_notes.split("\n").filter((f: string) => f.trim()).map((f: string) => `- ${f.trim()}`).join("\n") : "- Not specified"}

Monetization Strategy:
${body.monetization || "Not specified"}

Using the web research above as your primary source of truth, provide a thorough, honest analysis with specific competitor names, real pain points, and current market trends.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0,
      seed: 42,
      max_tokens: 3000,
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
