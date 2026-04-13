import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_VERSION = "v1";
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const parseLimit = (value: string | null) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
};

const parseOffset = (value: string | null) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const listMeta = ({
  resource,
  limit,
  offset,
  count,
}: {
  resource: string;
  limit: number;
  offset: number;
  count: number | null;
}) => ({
  version: API_VERSION,
  resource,
  pagination: {
    limit,
    offset,
    count,
    has_more: count === null ? null : offset + limit < count,
  },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json(
      {
        error: {
          code: "method_not_allowed",
          message: "Only GET requests are supported by this endpoint.",
        },
      },
      405,
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json(
      {
        error: {
          code: "missing_authorization",
          message: "Send a valid user access token in the Authorization Bearer header.",
        },
      },
      401,
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return json(
        {
          error: {
            code: "invalid_token",
            message: "The supplied bearer token is invalid or expired.",
          },
        },
        401,
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const resource = pathParts[2] || url.searchParams.get("resource");
    const resourceId = pathParts[3] || url.searchParams.get("id");
    const limit = parseLimit(url.searchParams.get("limit"));
    const offset = parseOffset(url.searchParams.get("offset"));

    if (!resource) {
      return json({
        api: "CreatorPay Authenticated Data API",
        version: API_VERSION,
        auth: "user_bearer_token",
        resources: {
          campaigns: "Brand-scoped via RLS",
          creators: "Authenticated marketplace directory",
          payroll: "Brand-scoped via RLS",
          analytics: "Authenticated summary metrics",
          fraud: "Authenticated fraud view",
          benchmarks: "Authenticated benchmark catalog",
        },
      });
    }

    switch (resource) {
      case "campaigns": {
        if (resourceId) {
          const { data, error } = await supabaseClient
            .from("campaigns")
            .select("*")
            .eq("id", resourceId)
            .maybeSingle();

          if (error) throw error;
          if (!data) {
            return json({ error: { code: "not_found", message: "Campaign not found." } }, 404);
          }

          return json({ data, meta: { version: API_VERSION, resource } });
        }

        const { data, error, count } = await supabaseClient
          .from("campaigns")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return json({ data: data ?? [], meta: listMeta({ resource, limit, offset, count }) });
      }

      case "creators": {
        if (resourceId) {
          const { data, error } = await supabaseClient
            .from("creators")
            .select("*")
            .eq("id", resourceId)
            .maybeSingle();

          if (error) throw error;
          if (!data) {
            return json({ error: { code: "not_found", message: "Creator not found." } }, 404);
          }

          return json({ data, meta: { version: API_VERSION, resource } });
        }

        let query = supabaseClient
          .from("creators")
          .select("*", { count: "exact" })
          .order("trust_score", { ascending: false })
          .range(offset, offset + limit - 1);

        const category = url.searchParams.get("category");
        const platform = url.searchParams.get("platform");
        const minEngagement = url.searchParams.get("min_engagement");

        if (category) query = query.eq("category", category);
        if (platform) query = query.contains("platforms", [platform]);
        if (minEngagement) query = query.gte("avg_engagement_rate", Number.parseFloat(minEngagement));

        const { data, error, count } = await query;
        if (error) throw error;

        return json({
          data: data ?? [],
          meta: {
            ...listMeta({ resource, limit, offset, count }),
            filters: {
              category: category ?? null,
              platform: platform ?? null,
              min_engagement: minEngagement ?? null,
            },
          },
        });
      }

      case "payroll": {
        const { data, error, count } = await supabaseClient
          .from("payroll")
          .select("*, campaign_creators(*, creators(name, handle), campaigns(name))", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return json({ data: data ?? [], meta: listMeta({ resource, limit, offset, count }) });
      }

      case "analytics": {
        const [campaignsRes, creatorsRes, payrollRes, contentRes] = await Promise.all([
          supabaseClient.from("campaigns").select("id, status, budget, spent"),
          supabaseClient.from("creators").select("id, trust_score, avg_engagement_rate"),
          supabaseClient.from("payroll").select("total_payment, status"),
          supabaseClient.from("creator_content").select("views, likes, comments, shares"),
        ]);

        if (campaignsRes.error) throw campaignsRes.error;
        if (creatorsRes.error) throw creatorsRes.error;
        if (payrollRes.error) throw payrollRes.error;
        if (contentRes.error) throw contentRes.error;

        const campaigns = campaignsRes.data ?? [];
        const creators = creatorsRes.data ?? [];
        const payrolls = payrollRes.data ?? [];
        const contents = contentRes.data ?? [];

        return json({
          data: {
            total_campaigns: campaigns.length,
            active_campaigns: campaigns.filter((campaign) => campaign.status === "active").length,
            total_budget: campaigns.reduce((sum, campaign) => sum + (campaign.budget ?? 0), 0),
            total_spent: campaigns.reduce((sum, campaign) => sum + (campaign.spent ?? 0), 0),
            total_creators: creators.length,
            avg_trust_score:
              creators.length > 0
                ? creators.reduce((sum, creator) => sum + (creator.trust_score ?? 0), 0) / creators.length
                : 0,
            total_payouts: payrolls.reduce((sum, payroll) => sum + (payroll.total_payment ?? 0), 0),
            total_views: contents.reduce((sum, content) => sum + (content.views ?? 0), 0),
            total_engagement: contents.reduce(
              (sum, content) => sum + (content.likes ?? 0) + (content.comments ?? 0) + (content.shares ?? 0),
              0,
            ),
          },
          meta: { version: API_VERSION, resource },
        });
      }

      case "fraud": {
        const { data, error, count } = await supabaseClient
          .from("creators")
          .select("id, name, handle, fraud_risk_score, fraud_indicators, last_fraud_scan", { count: "exact" })
          .order("fraud_risk_score", { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return json({ data: data ?? [], meta: listMeta({ resource, limit, offset, count }) });
      }

      case "benchmarks": {
        const { data, error, count } = await supabaseClient
          .from("industry_benchmarks")
          .select("*", { count: "exact" })
          .order("category")
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return json({ data: data ?? [], meta: listMeta({ resource, limit, offset, count }) });
      }

      default:
        return json(
          {
            error: {
              code: "unknown_resource",
              message: `Unknown resource: ${resource}`,
            },
          },
          404,
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json(
      {
        error: {
          code: "server_error",
          message,
        },
      },
      500,
    );
  }
});
