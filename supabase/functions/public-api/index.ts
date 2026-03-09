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

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // Path: /public-api/v1/{resource}[/{id}]
    const resource = pathParts[2] || url.searchParams.get("resource");
    const resourceId = pathParts[3] || url.searchParams.get("id");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (!resource) {
      return new Response(JSON.stringify({
        api: "CreatorPay API v1",
        endpoints: [
          "GET /campaigns - List campaigns",
          "GET /campaigns/:id - Get campaign by ID",
          "GET /creators - List creators",
          "GET /creators/:id - Get creator by ID",
          "GET /payroll - List payroll entries",
          "GET /analytics - Get analytics summary",
          "GET /fraud - Get fraud detection data",
          "GET /benchmarks - Get industry benchmarks",
        ],
        params: "?limit=50&offset=0",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let data: any = null;
    let error: any = null;

    switch (resource) {
      case "campaigns": {
        if (resourceId) {
          const res = await supabaseClient.from("campaigns").select("*").eq("id", resourceId).single();
          data = res.data; error = res.error;
        } else {
          const res = await supabaseClient.from("campaigns").select("*").range(offset, offset + limit - 1).order("created_at", { ascending: false });
          data = res.data; error = res.error;
        }
        break;
      }
      case "creators": {
        if (resourceId) {
          const res = await supabaseClient.from("creators").select("*").eq("id", resourceId).single();
          data = res.data; error = res.error;
        } else {
          const q = supabaseClient.from("creators").select("*").range(offset, offset + limit - 1).order("trust_score", { ascending: false });
          const category = url.searchParams.get("category");
          const platform = url.searchParams.get("platform");
          const minEngagement = url.searchParams.get("min_engagement");
          if (category) q.eq("category", category);
          if (platform) q.contains("platforms", [platform]);
          if (minEngagement) q.gte("avg_engagement_rate", parseFloat(minEngagement));
          const res = await q;
          data = res.data; error = res.error;
        }
        break;
      }
      case "payroll": {
        const res = await supabaseClient.from("payroll").select("*, campaign_creators(*, creators(name, handle), campaigns(name))").range(offset, offset + limit - 1).order("created_at", { ascending: false });
        data = res.data; error = res.error;
        break;
      }
      case "analytics": {
        const [campaignsRes, creatorsRes, payrollRes, contentRes] = await Promise.all([
          supabaseClient.from("campaigns").select("id, status, budget, spent"),
          supabaseClient.from("creators").select("id, trust_score, avg_engagement_rate"),
          supabaseClient.from("payroll").select("total_payment, status"),
          supabaseClient.from("creator_content").select("views, likes, comments, shares"),
        ]);
        const campaigns = campaignsRes.data || [];
        const creators = creatorsRes.data || [];
        const payrolls = payrollRes.data || [];
        const contents = contentRes.data || [];
        data = {
          total_campaigns: campaigns.length,
          active_campaigns: campaigns.filter((c: any) => c.status === "active").length,
          total_budget: campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0),
          total_spent: campaigns.reduce((s: number, c: any) => s + (c.spent || 0), 0),
          total_creators: creators.length,
          avg_trust_score: creators.length > 0 ? creators.reduce((s: number, c: any) => s + (c.trust_score || 0), 0) / creators.length : 0,
          total_payouts: payrolls.reduce((s: number, p: any) => s + (p.total_payment || 0), 0),
          total_views: contents.reduce((s: number, c: any) => s + (c.views || 0), 0),
          total_engagement: contents.reduce((s: number, c: any) => s + (c.likes || 0) + (c.comments || 0) + (c.shares || 0), 0),
        };
        break;
      }
      case "fraud": {
        const res = await supabaseClient.from("creators").select("id, name, handle, fraud_risk_score, fraud_indicators, last_fraud_scan").order("fraud_risk_score", { ascending: false }).range(offset, offset + limit - 1);
        data = res.data; error = res.error;
        break;
      }
      case "benchmarks": {
        const res = await supabaseClient.from("industry_benchmarks").select("*").order("category").range(offset, offset + limit - 1);
        data = res.data; error = res.error;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: `Unknown resource: ${resource}` }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (error) throw error;

    return new Response(JSON.stringify({ data, meta: { limit, offset, resource } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
