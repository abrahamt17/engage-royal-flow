import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FraudIndicator {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  score: number;
}

function analyzeEngagementPatterns(creator: any, contentItems: any[]): FraudIndicator[] {
  const indicators: FraudIndicator[] = [];
  const followers = creator.follower_count ?? 0;
  const engRate = creator.avg_engagement_rate ?? 0;

  // 1. Engagement-to-follower ratio anomaly
  if (followers > 100000 && engRate > 8) {
    indicators.push({
      type: "engagement_anomaly",
      severity: "high",
      description: `Abnormally high engagement rate (${engRate}%) for ${(followers / 1000).toFixed(0)}k followers`,
      score: 20,
    });
  } else if (followers > 10000 && engRate > 15) {
    indicators.push({
      type: "engagement_anomaly",
      severity: "critical",
      description: `Suspiciously high engagement rate (${engRate}%) suggests artificial boosting`,
      score: 30,
    });
  }

  // 2. Very low engagement with high followers (bought followers)
  if (followers > 50000 && engRate < 0.3) {
    indicators.push({
      type: "dead_followers",
      severity: "high",
      description: `Very low engagement (${engRate}%) despite ${(followers / 1000).toFixed(0)}k followers — likely purchased`,
      score: 25,
    });
  }

  // 3. Content performance spikes (anomaly detection)
  if (contentItems.length >= 2) {
    const viewsList = contentItems.map((c) => c.views ?? 0).filter((v) => v > 0);
    if (viewsList.length >= 2) {
      const avg = viewsList.reduce((a, b) => a + b, 0) / viewsList.length;
      const stdDev = Math.sqrt(viewsList.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / viewsList.length);
      const spikes = viewsList.filter((v) => v > avg + 3 * stdDev);
      if (spikes.length > 0 && avg > 0) {
        indicators.push({
          type: "view_spike",
          severity: "medium",
          description: `${spikes.length} content piece(s) with views ${(spikes[0] / avg).toFixed(1)}x above average — potential view botting`,
          score: 15,
        });
      }
    }

    // 4. Bot-like comment patterns
    const avgLikes = contentItems.reduce((s, c) => s + (c.likes ?? 0), 0) / contentItems.length;
    const avgComments = contentItems.reduce((s, c) => s + (c.comments ?? 0), 0) / contentItems.length;
    if (avgLikes > 100 && avgComments < 2) {
      indicators.push({
        type: "bot_comments",
        severity: "high",
        description: `High likes (avg ${avgLikes.toFixed(0)}) but near-zero comments (avg ${avgComments.toFixed(1)}) — bot-like pattern`,
        score: 20,
      });
    }

    // 5. Suspicious like-to-view ratio
    for (const content of contentItems) {
      const views = content.views ?? 0;
      const likes = content.likes ?? 0;
      if (views > 100 && likes / views > 0.5) {
        indicators.push({
          type: "like_ratio_anomaly",
          severity: "medium",
          description: `Content has ${((likes / views) * 100).toFixed(1)}% like-to-view ratio (normal: 3-8%)`,
          score: 15,
        });
        break;
      }
    }

    // 6. Watch time anomaly
    const avgWatchTime = contentItems.reduce((s, c) => s + (c.watch_time_pct ?? 0), 0) / contentItems.length;
    if (avgWatchTime > 0 && avgWatchTime < 10 && engRate > 5) {
      indicators.push({
        type: "watch_engagement_mismatch",
        severity: "high",
        description: `Only ${avgWatchTime.toFixed(1)}% avg watch time but ${engRate}% engagement — engagement likely artificial`,
        score: 20,
      });
    }
  }

  return indicators;
}

function calculateFraudScore(indicators: FraudIndicator[]): number {
  const raw = indicators.reduce((sum, ind) => sum + ind.score, 0);
  return Math.min(100, raw);
}

function scoreContent(content: any): { score: number; indicators: FraudIndicator[] } {
  const indicators: FraudIndicator[] = [];
  const views = content.views ?? 0;
  const likes = content.likes ?? 0;
  const comments = content.comments ?? 0;
  const shares = content.shares ?? 0;
  const watchTime = content.watch_time_pct ?? 0;

  if (views > 100 && likes / views > 0.5) {
    indicators.push({ type: "like_ratio", severity: "high", description: "Abnormal like-to-view ratio", score: 20 });
  }
  if (views > 500 && comments < 1) {
    indicators.push({ type: "no_comments", severity: "medium", description: "Zero comments despite high views", score: 10 });
  }
  if (likes > 100 && shares === 0 && comments === 0) {
    indicators.push({ type: "engagement_only_likes", severity: "medium", description: "Likes but no other engagement signals", score: 15 });
  }
  if (watchTime > 0 && watchTime < 5 && likes > 50) {
    indicators.push({ type: "low_watch_high_likes", severity: "high", description: "Very low watch time but high likes", score: 20 });
  }

  return { score: Math.min(100, indicators.reduce((s, i) => s + i.score, 0)), indicators };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ===== ADD YOUR OPENAI API KEY (optional for enhanced AI analysis) =====
    // Set via Supabase Dashboard: Settings → Edge Functions → Secrets
    // Or via CLI: supabase secrets set OPENAI_API_KEY=sk-your-key-here
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { creator_id, scan_all, dismiss } = await req.json();

    // Handle dismiss action
    if (dismiss && creator_id) {
      const { error } = await supabase
        .from("creators")
        .update({ fraud_risk_score: 0, fraud_indicators: [], last_fraud_scan: new Date().toISOString() })
        .eq("id", creator_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, action: "dismissed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get creators to scan
    let creatorsQuery = supabase.from("creators").select("*");
    if (!scan_all && creator_id) {
      creatorsQuery = creatorsQuery.eq("id", creator_id);
    }
    const { data: creators, error: creatorsErr } = await creatorsQuery;
    if (creatorsErr) throw creatorsErr;

    const results = [];

    for (const creator of creators ?? []) {
      const { data: ccLinks } = await supabase
        .from("campaign_creators")
        .select("id")
        .eq("creator_id", creator.id);

      const ccIds = (ccLinks ?? []).map((l) => l.id);
      let contentItems: any[] = [];
      if (ccIds.length > 0) {
        const { data: content } = await supabase
          .from("creator_content")
          .select("*")
          .in("campaign_creator_id", ccIds);
        contentItems = content ?? [];
      }

      // Heuristic analysis
      const indicators = analyzeEngagementPatterns(creator, contentItems);
      const heuristicScore = calculateFraudScore(indicators);

      // AI-enhanced analysis if API key is configured
      let aiAnalysis = null;
      if (OPENAI_API_KEY && contentItems.length > 0) {
        try {
          const prompt = `Analyze this influencer for potential fraud. Return a JSON object with "risk_assessment" (string), "confidence" (number 0-100), and "additional_flags" (array of strings).

Creator: ${creator.name} (@${creator.handle})
Followers: ${creator.follower_count}
Avg Engagement: ${creator.avg_engagement_rate}%
Platforms: ${creator.platforms?.join(", ")}
Category: ${creator.category}

Content metrics (${contentItems.length} pieces):
${contentItems.slice(0, 5).map((c, i) => `  ${i + 1}. Views: ${c.views}, Likes: ${c.likes}, Comments: ${c.comments}, Shares: ${c.shares}, Watch Time: ${c.watch_time_pct}%, CTR: ${c.ctr}%`).join("\n")}

Heuristic flags already detected:
${indicators.map((i) => `- [${i.severity}] ${i.description}`).join("\n") || "None"}`;

          const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are a fraud detection analyst for influencer marketing. Analyze creator metrics for signs of fake engagement, bot activity, and purchased followers. Return JSON only." },
                { role: "user", content: prompt },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const content = aiData.choices?.[0]?.message?.content;
            if (content) {
              aiAnalysis = JSON.parse(content);
            }
          }
        } catch (e) {
          console.error("AI analysis failed, using heuristics only:", e);
        }
      }

      // Combine scores
      const aiModifier = aiAnalysis?.ai_score_modifier ?? 0;
      const finalScore = Math.max(0, Math.min(100, heuristicScore + Math.max(-10, Math.min(30, aiModifier))));

      // Add AI flags as indicators
      if (aiAnalysis?.additional_flags) {
        for (const flag of aiAnalysis.additional_flags) {
          indicators.push({
            type: "ai_detected",
            severity: finalScore >= 50 ? "high" : "medium",
            description: flag,
            score: 0,
          });
        }
      }

      // Update creator
      await supabase
        .from("creators")
        .update({
          fraud_risk_score: finalScore,
          fraud_indicators: indicators,
          last_fraud_scan: new Date().toISOString(),
        })
        .eq("id", creator.id);

      // Score individual content pieces
      for (const content of contentItems) {
        const contentResult = scoreContent(content);
        await supabase
          .from("creator_content")
          .update({
            fraud_risk_score: contentResult.score,
            fraud_indicators: contentResult.indicators,
          })
          .eq("id", content.id);
      }

      results.push({
        creator_id: creator.id,
        name: creator.name,
        previous_score: creator.fraud_risk_score,
        new_score: finalScore,
        indicators_count: indicators.length,
        ai_analysis: aiAnalysis
          ? { assessment: aiAnalysis.risk_assessment, confidence: aiAnalysis.confidence }
          : null,
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-fraud error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
