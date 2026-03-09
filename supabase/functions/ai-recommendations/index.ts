import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ===== ADD YOUR OPENAI API KEY =====
    // Set via Supabase Dashboard: Settings → Edge Functions → Secrets
    // Or via CLI: supabase secrets set OPENAI_API_KEY=sk-your-key-here
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const { type, context } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "recommend_creators") {
      systemPrompt = `You are an influencer marketing AI. Analyze campaign requirements and creator data to recommend the best creators. Return structured recommendations.`;
      userPrompt = `Campaign: ${JSON.stringify(context.campaign)}
Available creators: ${JSON.stringify(context.creators)}
Recommend the top 5 creators for this campaign. For each, explain WHY they're a good match based on audience demographics, engagement rate, platform fit, and content category.`;
    } else if (type === "posting_time") {
      systemPrompt = `You are a social media analytics AI. Analyze engagement patterns to predict optimal posting times.`;
      userPrompt = `Platform: ${context.platform}
Target audience: ${JSON.stringify(context.targetAudience)}
Historical content performance: ${JSON.stringify(context.contentHistory?.slice(0, 10))}
Predict the best 3 posting times (day of week + hour) for maximum engagement. Explain your reasoning.`;
    } else if (type === "content_prediction") {
      systemPrompt = `You are a content performance prediction AI. Analyze past content metrics to predict future performance.`;
      userPrompt = `Creator: ${JSON.stringify(context.creator)}
Past content metrics: ${JSON.stringify(context.contentHistory?.slice(0, 10))}
Campaign goals: ${JSON.stringify(context.campaignGoals)}
Predict the expected performance for their next piece of content. Include estimated views, engagement rate, and performance score.`;
    } else if (type === "campaign_optimization") {
      systemPrompt = `You are a campaign optimization AI. Analyze campaign performance data and suggest improvements.`;
      userPrompt = `Campaign: ${JSON.stringify(context.campaign)}
Current metrics: ${JSON.stringify(context.metrics)}
Creator performance: ${JSON.stringify(context.creatorPerformance?.slice(0, 10))}
Suggest 5 specific, actionable optimizations to improve campaign ROI.`;
    } else if (type === "brand_safety") {
      systemPrompt = `You are a brand safety AI. Analyze content and creator profiles for potential brand safety risks. Be thorough but fair.`;
      userPrompt = `Brand: ${JSON.stringify(context.brand)}
Creator: ${JSON.stringify(context.creator)}
Recent content topics: ${JSON.stringify(context.contentTopics)}
Fraud indicators: ${JSON.stringify(context.fraudIndicators)}
Assess brand safety risk on a scale of 0-100. Identify specific risks and recommend mitigation strategies.`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown recommendation type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      throw new Error(`AI API error: ${response.status} ${t}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("ai-recommendations error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
