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
    
    // === PERFORMANCE SCORE (weighted) ===
    const v = views || 0;
    const l = likes || 0;
    const c = comments || 0;
    const sh = shares || 0;
    const sv = saves || 0;
    const wt = watch_time_pct || 0;

    const engagementRate = v > 0 ? (l + c + sh + sv) / v : 0;
    const shareRate = v > 0 ? sh / v : 0;
    const saveRate = v > 0 ? sv / v : 0;
    const commentRate = v > 0 ? c / v : 0;
    const watchTimeScore = Math.min(wt / 100, 1);

    const perfScore = Math.min(100, Math.max(0,
      (0.30 * watchTimeScore * 100) +
      (0.20 * Math.min(engagementRate * 500, 100)) +
      (0.15 * Math.min(shareRate * 2000, 100)) +
      (0.15 * Math.min(saveRate * 2000, 100)) +
      (0.10 * Math.min(commentRate * 1000, 100)) +
      (0.10 * Math.min(v / 100000 * 100, 100))
    ));

    // === AUDIENCE MATCH SCORE ===
    const matchScore = 1.0; // Default — enhanced when audience data available

    // === BONUS SYSTEM ===
    const multiplier = formula.performance_multiplier || 1.0;
    const basePay = campaignCreator.base_pay || formula.base_pay || 0;
    let bonus = formula.conversion_bonus || 0;

    // Milestone bonus: if views exceed thresholds
    if (v >= 1000000) bonus += basePay * 0.5;       // 1M+ views: 50% bonus
    else if (v >= 500000) bonus += basePay * 0.25;   // 500K+: 25% bonus
    else if (v >= 100000) bonus += basePay * 0.10;   // 100K+: 10% bonus

    // Virality bonus: high share rate indicates viral content
    if (shareRate > 0.05) bonus += basePay * 0.3;     // 5%+ share rate
    else if (shareRate > 0.02) bonus += basePay * 0.15;

    // High-retention bonus: excellent watch time
    if (wt >= 80) bonus += basePay * 0.2;             // 80%+ watch time
    else if (wt >= 60) bonus += basePay * 0.1;

    // === TOTAL PAYMENT ===
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

    return new Response(JSON.stringify({ 
      success: true, 
      content, 
      payroll,
      bonusBreakdown: {
        conversionBonus: formula.conversion_bonus || 0,
        milestoneBonus: v >= 1000000 ? basePay * 0.5 : v >= 500000 ? basePay * 0.25 : v >= 100000 ? basePay * 0.10 : 0,
        viralityBonus: shareRate > 0.05 ? basePay * 0.3 : shareRate > 0.02 ? basePay * 0.15 : 0,
        retentionBonus: wt >= 80 ? basePay * 0.2 : wt >= 60 ? basePay * 0.1 : 0,
        totalBonus: bonus,
      }
    }), {
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
