import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { content_id, description } = await req.json();
    if (!content_id) {
      return new Response(JSON.stringify({ error: "content_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch content details
    const { data: content, error: cErr } = await supabaseClient
      .from("creator_content")
      .select("*, campaign_creators(*, creators(*), campaigns(*))")
      .eq("id", content_id)
      .single();

    if (cErr || !content) throw new Error("Content not found");

    const creator = content.campaign_creators?.creators;
    const campaign = content.campaign_creators?.campaigns;

    // Build analysis prompt
    const prompt = `Analyze this creator content for brand marketing quality. Return a JSON object with these exact fields:
{
  "brand_exposure_score": (0-100, how well the brand is showcased),
  "sentiment_score": (0-100, overall sentiment positivity),
  "ad_compliance_score": (0-100, advertising compliance level),
  "content_quality_score": (0-100, production and content quality),
  "brand_safety_score": (0-100, brand safety assessment),
  "product_visibility": (boolean, is the product clearly shown),
  "brand_logo_seconds": (number, estimated logo display time in seconds),
  "verbal_mentions": (integer, estimated brand/product verbal mentions),
  "key_findings": (array of 3-6 short findings strings)
}

Content Details:
- Creator: ${creator?.name} (${creator?.handle})
- Platform: ${content.platform}
- Campaign: ${campaign?.name}
- Views: ${content.views}, Likes: ${content.likes}, Comments: ${content.comments}
- Shares: ${content.shares}, Saves: ${content.saves}
- Watch Time: ${content.watch_time_pct}%
- Engagement Rate: ${content.views > 0 ? (((content.likes || 0) + (content.comments || 0) + (content.shares || 0)) / content.views * 100).toFixed(2) : 0}%
${content.content_url ? `- Content URL: ${content.content_url}` : ""}
${description ? `- Description: ${description}` : ""}

Analyze comprehensively. Return ONLY the JSON object, no other text.`;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a content analysis AI for brand marketing. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "{}";
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    
    const analysis = JSON.parse(jsonStr.trim());

    // Store analysis
    const { data: stored, error: storeErr } = await supabaseClient
      .from("content_analysis")
      .insert({
        content_id,
        brand_exposure_score: analysis.brand_exposure_score || 0,
        sentiment_score: analysis.sentiment_score || 0,
        ad_compliance_score: analysis.ad_compliance_score || 0,
        content_quality_score: analysis.content_quality_score || 0,
        brand_safety_score: analysis.brand_safety_score || 0,
        product_visibility: analysis.product_visibility || false,
        brand_logo_seconds: analysis.brand_logo_seconds || 0,
        verbal_mentions: analysis.verbal_mentions || 0,
        key_findings: analysis.key_findings || [],
        model_used: "gpt-4o-mini",
      })
      .select()
      .single();

    if (storeErr) throw storeErr;

    return new Response(JSON.stringify({ success: true, analysis: stored }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
