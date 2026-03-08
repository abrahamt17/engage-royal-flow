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
      Deno.env.get("VITE_SUPABASE_URL") ?? "",
      Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const { campaign_creator_id, platform, views, likes, comments, shares, saves, watch_time_pct, content_url } = await req.json();

    if (!campaign_creator_id || !platform) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert content metrics
    const { data: content, error: contentError } = await supabaseClient
      .from("creator_content")
      .insert({
        campaign_creator_id,
        platform,
        views: views || 0,
        likes: likes || 0,
        comments: comments || 0,
        shares: shares || 0,
        saves: saves || 0,
        watch_time_pct: watch_time_pct || 0,
        content_url,
      })
      .select()
      .single();

    if (contentError) throw contentError;

    // Get campaign & creator data for payroll calculation
    const { data: campaignCreator, error: ccError } = await supabaseClient
      .from("campaign_creators")
      .select("*, campaigns(*, brands(*))")
      .eq("id", campaign_creator_id)
      .single();

    if (ccError || !campaignCreator) throw new Error("Could not fetch campaign details");

    const campaign = campaignCreator.campaigns;
    const formula = campaign.payroll_formula || { base_pay: 500, performance_multiplier: 2.5, conversion_bonus: 0 };
    
    // Calculate simple performance score based on views & engagement
    const engagement = (likes + comments + shares + saves);
    const engagementRate = views > 0 ? engagement / views : 0;
    
    // Performance score from 0-100 (simplified logic)
    const perfScore = Math.min(100, Math.max(0, (engagementRate * 1000) + (views / 10000)));
    
    // Default match score to 1.0 (100%) for simplicity
    const matchScore = 1.0;
    
    // Compute total payroll
    const multiplier = formula.performance_multiplier || 1.0;
    const basePay = campaignCreator.base_pay || formula.base_pay || 0;
    const bonus = formula.conversion_bonus || 0;
    
    // Payment = BasePay × (PerfScore/100 × MatchScore × Multiplier) + Bonus
    const totalPayment = basePay * ((perfScore / 100) * matchScore * multiplier) + bonus;

    // Update content with scores
    await supabaseClient
      .from("creator_content")
      .update({ performance_score: perfScore, audience_match_score: matchScore * 100 })
      .eq("id", content.id);

    // Create payroll entry
    const { data: payroll, error: payrollError } = await supabaseClient
      .from("payroll")
      .insert({
        campaign_creator_id,
        content_id: content.id,
        base_pay: basePay,
        perf_score: perfScore,
        match_score: matchScore * 100,
        multiplier,
        bonus,
        total_payment: totalPayment,
        currency: "USD",
        status: "pending",
      })
      .select()
      .single();

    if (payrollError) throw payrollError;

    // Update total earned on campaign_creator
    await supabaseClient
      .from("campaign_creators")
      .update({ 
        total_earned: (campaignCreator.total_earned || 0) + totalPayment 
      })
      .eq("id", campaign_creator_id);

    // Update total spent on campaign
    await supabaseClient
      .from("campaigns")
      .update({ 
        spent: (campaign.spent || 0) + totalPayment 
      })
      .eq("id", campaign.id);

    return new Response(JSON.stringify({ success: true, content, payroll }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
