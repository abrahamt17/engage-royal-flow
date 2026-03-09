import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const { campaign_id, brand_id, automation_type, config } = await req.json();
    if (!campaign_id || !brand_id) throw new Error("campaign_id and brand_id required");

    // Fetch available creators
    const { data: creators } = await supabaseClient
      .from("creators")
      .select("*")
      .order("trust_score", { ascending: false })
      .limit(20);

    // Fetch campaign details
    const { data: campaign } = await supabaseClient
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    const prompt = `You are a campaign automation AI. Based on the data below, recommend the best strategy. Return ONLY valid JSON:
{
  "creators_matched": (number, how many creators were matched),
  "recommended_creators": (array of creator names),
  "budget_allocation": (string, how to allocate the budget),
  "recommendation": (string, overall strategy recommendation),
  "estimated_reach": (number, estimated total reach)
}

Campaign: ${campaign?.name}
Budget: $${config.budget || campaign?.budget}
Target Audience: ${config.target_audience || "General"}
Goal: ${config.goal || "Maximize engagement"}
Automation Type: ${automation_type}

Available Creators (top by trust score):
${(creators || []).slice(0, 10).map((c: any) => `- ${c.name} (${c.handle}): Trust ${c.trust_score}, Engagement ${c.avg_engagement_rate}%, Followers ${c.follower_count}, Category: ${c.category}`).join("\n")}

Return ONLY the JSON.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a campaign automation AI. Return valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI automation failed");
    }

    const aiData = await aiResponse.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    let jsonStr = raw;
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1];
    const results = JSON.parse(jsonStr.trim());

    // Store automation
    const { data: automation, error: autoErr } = await supabaseClient
      .from("campaign_automations")
      .insert({
        campaign_id,
        brand_id,
        automation_type,
        config,
        status: "active",
        last_run_at: new Date().toISOString(),
        results,
      })
      .select()
      .single();

    if (autoErr) throw autoErr;

    return new Response(JSON.stringify({ success: true, automation, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
