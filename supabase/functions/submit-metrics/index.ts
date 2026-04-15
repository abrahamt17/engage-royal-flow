import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { createPerformanceAlert } from "../_shared/performance-alerts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeToken = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");

const normalizeRange = (value: string) => {
  const trimmed = value.trim();
  const plusMatch = trimmed.match(/^(\d+)\+$/);

  if (plusMatch) {
    const start = Number(plusMatch[1]);
    return Number.isFinite(start) ? { min: start, max: 100 } : null;
  }

  const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!rangeMatch) return null;

  const min = Number(rangeMatch[1]);
  const max = Number(rangeMatch[2]);

  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    return null;
  }

  return { min, max };
};

const calculateAgeScore = (campaignAge: unknown, creatorAge: unknown) => {
  if (typeof campaignAge !== "string" || typeof creatorAge !== "string") {
    return null;
  }

  const campaignRange = normalizeRange(campaignAge);
  const creatorRange = normalizeRange(creatorAge);

  if (!campaignRange || !creatorRange) {
    return normalizeToken(campaignAge) === normalizeToken(creatorAge) ? 1 : 0.5;
  }

  const overlap = Math.max(
    0,
    Math.min(campaignRange.max, creatorRange.max) - Math.max(campaignRange.min, creatorRange.min),
  );
  const union = Math.max(campaignRange.max, creatorRange.max) - Math.min(campaignRange.min, creatorRange.min);

  if (union <= 0) {
    return 0;
  }

  return clamp(overlap / union);
};

const calculateGenderScore = (campaignGender: unknown, creatorGender: unknown) => {
  if (typeof campaignGender !== "string" || typeof creatorGender !== "string") {
    return null;
  }

  const campaign = normalizeToken(campaignGender);
  const creator = normalizeToken(creatorGender);

  if (campaign === "all" || campaign === "mixed") return 1;
  if (creator === "mixed") return 0.75;
  if (creator.includes(campaign)) return 1;

  return 0.2;
};

const calculateCountryScore = (campaignCountries: unknown, creatorCountries: unknown, creatorLocation: unknown) => {
  const campaign = toStringArray(campaignCountries).map(normalizeToken);
  const creator = toStringArray(creatorCountries).map(normalizeToken);
  const location = typeof creatorLocation === "string" ? normalizeToken(creatorLocation) : null;

  if (campaign.length === 0) return null;

  const creatorPool = new Set(creator);
  if (location) {
    creatorPool.add(location);
  }

  if (creatorPool.size === 0) {
    return 0.5;
  }

  const matches = campaign.filter((country) => {
    for (const creatorCountry of creatorPool) {
      if (creatorCountry === country || creatorCountry.includes(country) || country.includes(creatorCountry)) {
        return true;
      }
    }

    return false;
  }).length;

  return clamp(matches / campaign.length);
};

const calculateLanguageScore = (campaignLanguages: unknown, creatorLanguages: unknown) => {
  const campaign = toStringArray(campaignLanguages).map(normalizeToken);
  const creator = new Set(toStringArray(creatorLanguages).map(normalizeToken));

  if (campaign.length === 0) return null;
  if (creator.size === 0) return 0.5;

  const matches = campaign.filter((language) => creator.has(language)).length;
  return clamp(matches / campaign.length);
};

const calculateCategoryScore = (campaignInterests: unknown, creatorCategory: unknown) => {
  const interests = toStringArray(campaignInterests).map(normalizeToken);
  const category = typeof creatorCategory === "string" ? normalizeToken(creatorCategory) : "";

  if (interests.length === 0 || !category) return null;

  return interests.some((interest) => interest === category || interest.includes(category) || category.includes(interest))
    ? 1
    : 0.35;
};

const calculateAudienceMatchDetails = ({
  targetAudience,
  creatorDemographics,
  creatorCategory,
  creatorLanguages,
  creatorLocation,
}: {
  targetAudience: unknown;
  creatorDemographics: unknown;
  creatorCategory: unknown;
  creatorLanguages: unknown;
  creatorLocation: unknown;
}) => {
  const campaignAudience = isRecord(targetAudience) ? targetAudience : {};
  const creatorAudience = isRecord(creatorDemographics) ? creatorDemographics : {};

  const components = [
    {
      key: "age",
      label: "Age",
      score: calculateAgeScore(campaignAudience.age_range, creatorAudience.age_range),
      weight: 0.3,
    },
    {
      key: "gender",
      label: "Gender",
      score: calculateGenderScore(campaignAudience.genders ?? campaignAudience.gender, creatorAudience.gender_split ?? creatorAudience.gender),
      weight: 0.2,
    },
    {
      key: "country",
      label: "Country",
      score: calculateCountryScore(
        campaignAudience.countries ?? campaignAudience.country,
        creatorAudience.top_countries ?? creatorAudience.countries ?? creatorAudience.country,
        creatorLocation,
      ),
      weight: 0.2,
    },
    {
      key: "language",
      label: "Language",
      score: calculateLanguageScore(campaignAudience.languages ?? campaignAudience.language, creatorLanguages),
      weight: 0.15,
    },
    {
      key: "category",
      label: "Category",
      score: calculateCategoryScore(campaignAudience.interests ?? campaignAudience.categories, creatorCategory),
      weight: 0.15,
    },
  ];

  const weighted = components.filter((component) => component.score !== null) as Array<{
    key: string;
    label: string;
    score: number;
    weight: number;
  }>;

  const score =
    weighted.length === 0
      ? 0.7
      : clamp(
          weighted.reduce((sum, component) => sum + component.score * component.weight, 0) /
            weighted.reduce((sum, component) => sum + component.weight, 0),
        );

  return {
    score,
    components: components.map((component) => ({
      key: component.key,
      label: component.label,
      weight: component.weight,
      score: component.score === null ? null : Number((component.score * 100).toFixed(1)),
    })),
  };
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
      .select("*, campaigns(*, brands(*)), creators(*)")
      .eq("id", campaign_creator_id)
      .single();

    if (ccError || !campaignCreator) throw new Error("Could not fetch campaign details");

    const campaign = campaignCreator.campaigns;
    const creator = campaignCreator.creators;
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
    const audienceMatch = calculateAudienceMatchDetails({
      targetAudience: campaign.target_audience,
      creatorDemographics: creator?.audience_demographics,
      creatorCategory: creator?.category,
      creatorLanguages: creator?.languages,
      creatorLocation: creator?.location,
    });
    const matchScore = audienceMatch.score;

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

    if (v >= 1000000 || shareRate >= 0.05) {
      await createPerformanceAlert(supabaseClient, {
        campaign_id: campaign.id,
        creator_id: creator?.id ?? null,
        content_id: content.id,
        alert_type: "viral",
        title: "Content is going viral",
        message: `${creator?.name ?? "A creator"} crossed a viral threshold on ${platform}.`,
        metric_name: v >= 1000000 ? "views" : "share_rate_pct",
        metric_value: v >= 1000000 ? v : Number((shareRate * 100).toFixed(2)),
        threshold: v >= 1000000 ? 1000000 : 5,
      });
    }

    if (perfScore >= 75) {
      await createPerformanceAlert(supabaseClient, {
        campaign_id: campaign.id,
        creator_id: creator?.id ?? null,
        content_id: content.id,
        alert_type: "trending",
        title: "High-performing content detected",
        message: `${creator?.name ?? "A creator"} submitted content with a strong performance score.`,
        metric_name: "performance_score",
        metric_value: Number(perfScore.toFixed(1)),
        threshold: 75,
      });
    }

    if (matchScore < 0.5) {
      await createPerformanceAlert(supabaseClient, {
        campaign_id: campaign.id,
        creator_id: creator?.id ?? null,
        content_id: content.id,
        alert_type: "warning",
        title: "Audience mismatch warning",
        message: `${creator?.name ?? "A creator"} content under-indexed against the campaign target audience.`,
        metric_name: "audience_match_score",
        metric_value: Number((matchScore * 100).toFixed(1)),
        threshold: 50,
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      content, 
      payroll,
      audienceMatch,
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
