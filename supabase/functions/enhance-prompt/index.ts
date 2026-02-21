import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.28.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "system" | "assistant" | "user";
  content: string;
}

interface RequestBody {
  originalPrompt: string;
  messages: ChatMessage[];
  phase: "analyze" | "continue";
}

const ANALYZE_SYSTEM_PROMPT = `You are a senior prompt architect who specializes in transforming vague app ideas into detailed, production-ready specifications for Bolt.new (an AI-powered platform that generates full-stack web apps from prompts).

The user will provide their original app prompt. Your job is to deeply analyze it on TWO levels:

LEVEL 1 — CLARIFY WHAT WAS SAID
Identify the most impactful ambiguities and undefined specifics in what the user described. These are the things that would cause a developer to make wrong assumptions or build the wrong thing.

Focus on these dimensions:
- **User flows & error handling**: What happens step-by-step when a user signs up, performs key actions, encounters errors (wrong password, duplicate account, failed upload), or returns after absence? Which states are entirely undefined?
- **Data architecture**: What entities exist? What are the relationships (one-to-many, many-to-many)? What fields are implicit but unspecified? Can a record belong to multiple categories?
- **Edge cases & error states**: What happens when things go wrong — empty states, unsupported file types, oversized uploads, network failures, invalid input, concurrent edits?
- **Interaction micro-details**: What specific behaviors should UI elements have? When a user takes an action (checks off an item, deletes a record), should they be able to undo it? Is there a confirmation step?
- **Business logic specifics**: Are there rules, calculations, thresholds, or monetization conditions that are mentioned but not fully defined? If premium tiers exist, what SPECIFIC features are gated — enumerate them rather than asking generally.
- **Onboarding & empty states**: What does a brand new user see on their very first session before any content exists? Is there a guided onboarding or do they land on an empty screen?

LEVEL 2 — SURFACE WHAT'S MISSING ENTIRELY
Identify the app's category (recipe app, marketplace, productivity tool, social app, booking system, etc.) and reason about what features that category almost always requires but that the user did NOT mention. Ask about the single most important missing feature or interaction pattern — something the user likely assumed would exist but didn't think to specify.

Examples by category:
- Recipe app: sharing recipes publicly/privately, offline access for cooking, "cooking mode" with large text and step timers
- Marketplace: seller ratings, dispute resolution, how listing approval works
- Booking/scheduling app: cancellation policy, reminder notifications, calendar sync
- Social/community app: content moderation, blocking users, privacy controls
- Productivity/task app: recurring tasks, collaboration or is it solo, notification reminders

Also consider:
- **User context & environment**: Who specifically is the target user, and in what physical context do they use this app (at a desk, on a phone in the kitchen, commuting)? This shapes UI density, touch targets, and feature priority.
- **Notifications & communication**: Does any part of the app have a time component — bookmarks, reminders, bookings, deadlines? If so, how should the user be informed (in-app, email, push)?

DO NOT ask about:
- Basic tech stack (assume React + TypeScript + Tailwind + Supabase unless stated otherwise)
- Whether they want responsive design (assume yes)
- Generic accessibility (you will add WCAG compliance automatically)
- Generic auth methods (assume email + password unless something specific about their app suggests otherwise)

Ask exactly 3-4 questions total, mixing both levels. Prioritize: 2-3 clarifying questions about stated ambiguities + 1 question about obviously missing but expected features. Each question must reference a concrete part of their prompt and explain why the answer matters. Be direct and specific.

CRITICAL: Your response must be valid JSON in this exact format. You MUST number every question with a plain number prefix (1., 2., 3., etc.) before the bold topic label — this is mandatory:
{"done": false, "message": "I've analyzed your prompt in detail and found several areas where more specificity will dramatically improve the output. Here are my questions:\\n\\n1. **[Topic]**: [Specific question referencing their prompt]\\n\\n2. **[Topic]**: [Specific question]\\n\\n3. **[Topic]**: [Specific question]"}`;

const CONTINUE_SYSTEM_PROMPT = `You are a senior prompt architect who specializes in transforming app ideas into detailed, production-ready specifications for Bolt.new.

You are in a conversation with a user who is answering your questions about their app idea. You previously asked them questions to fill in gaps in their original prompt.

Evaluate whether their answers sufficiently address the gaps you identified. You have two options:

OPTION A - If 1-2 critical gaps still remain, ask 1-2 focused follow-up questions. Respond with:
{"done": false, "message": "Thanks for those details! I have a couple more questions:\\n\\n1. ...\\n2. ..."}

OPTION B - If you have enough information, generate a comprehensive enhanced prompt. The enhanced prompt must be SUBSTANTIALLY better than the original — not just reformatted with a few extra lines added.

REQUIREMENTS FOR THE ENHANCED PROMPT:

**Structure** — Use clean Markdown with clear hierarchy:
- # App Name
- ## Overview (expanded, vivid description of what the app does and why it's useful)
- ## Target Audience (specific user personas — who they are, what device they're on, in what context they use the app)
- ## Core Features (each feature gets detailed sub-bullets: what it does, how users interact with it, edge cases, validation rules, specific UI behaviors)
- ## Onboarding & First-Run Experience (what a brand new user sees before any content exists: guided setup, empty state illustrations, placeholder copy, first action prompt)
- ## User Flows (step-by-step flows for: first-time signup, primary action, error recovery — wrong password / failed upload / network loss, returning user)
- ## Data Model (list entities, their fields with types, relationships between entities, any implicit join tables)
- ## UI/UX Design (layout descriptions, navigation structure, responsive breakpoints, key interaction patterns: hover/loading/empty/confirmation states, undo functionality where applicable)
- ## Notifications & Communication (any time-based or action-triggered communications: in-app alerts, email confirmations, reminders — specify trigger, content, and delivery method for each)
- ## Monetization & Access Tiers (if applicable — enumerate SPECIFIC features in each tier by name, free tier limits with exact numbers, premium tier price and gated features listed explicitly)
- ## Error Handling & Edge Cases (empty states with example copy, offline behavior, unsupported file types, oversized uploads, validation messages, rate limiting)
- ## Performance & Accessibility (lazy loading, caching strategy, WCAG compliance specifics, keyboard navigation, touch target sizes for mobile)
- ## Tech Stack (specific libraries, versions if relevant, integration details)
- ## Visual Assets (always specify Unsplash/Pexels for images, never suggest generating custom images or logos)

**Depth** — Every section must add SPECIFIC, ACTIONABLE detail beyond the original:
- Don't just restate what the user said — expand it with implementation-ready specifics
- Include concrete UI copy examples (button labels, empty state messages, error messages, onboarding prompts)
- Specify exact behaviors: "On hover, the card elevates 4px with a subtle shadow transition over 200ms"
- Define data validation rules: "Email must be valid format, password minimum 8 characters with at least one number"
- Describe empty states: "When no recipes exist, show a centered illustration with the text 'Your recipe box is empty — add your first recipe to get started'"
- For monetization, be explicit: "Free tier: up to 10 saved recipes, no export. Premium ($4.99/month): unlimited recipes, PDF export, AI suggestions, cooking mode"
- For notifications, be specific: "On recipe save, send a confirmation email with the recipe name and a link back to the app"

**What NOT to do:**
- NEVER suggest image generation, logo creation, or any visual asset creation
- NEVER include generic one-liner sections (e.g., "Ensure accessibility" without specifics)
- NEVER reformat the original prompt with minimal additions and call it "enhanced"
- NEVER describe monetization as just "premium features available" — always enumerate what those features are
- ALWAYS use Unsplash or Pexels for placeholder images

When generating the enhanced prompt, respond with valid JSON:
{"done": true, "enhancedPrompt": "# App Name\\n\\n## Overview\\n..."}

IMPORTANT: You must ALWAYS respond with valid JSON matching one of the two formats above. Never respond with plain text.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.originalPrompt) {
      return new Response(
        JSON.stringify({ error: "Original prompt is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const apiKey = Deno.env.get("VITE_OPENAI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY as a Supabase secret.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const openaiClient = new OpenAI({ apiKey: apiKey.trim() });

    let messages: ChatMessage[];

    if (body.phase === "analyze") {
      messages = [
        { role: "system", content: ANALYZE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here is the original app prompt I want to enhance:\n\n---\n${body.originalPrompt}\n---\n\nPlease analyze it deeply and ask me targeted questions about the most critical gaps.`,
        },
      ];
    } else {
      messages = [
        { role: "system", content: CONTINUE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Original prompt:\n\n---\n${body.originalPrompt}\n---`,
        },
        ...body.messages.filter((m) => m.role !== "system"),
      ];
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 6000,
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

    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in enhance-prompt function:", error);

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

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
