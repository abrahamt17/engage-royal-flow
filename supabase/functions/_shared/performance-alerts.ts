export type AlertPayload = {
  campaign_id: string;
  creator_id?: string | null;
  content_id?: string | null;
  alert_type: "viral" | "trending" | "warning" | "info";
  title: string;
  message?: string | null;
  metric_name?: string | null;
  metric_value?: number | null;
  threshold?: number | null;
};

export async function createPerformanceAlert(
  supabase: {
    from: (table: string) => {
      insert: (payload: Record<string, unknown>) => Promise<{ error: { message?: string } | null }>;
    };
  },
  payload: AlertPayload,
) {
  const { error } = await supabase.from("performance_alerts").insert({
    campaign_id: payload.campaign_id,
    creator_id: payload.creator_id ?? null,
    content_id: payload.content_id ?? null,
    alert_type: payload.alert_type,
    title: payload.title,
    message: payload.message ?? null,
    metric_name: payload.metric_name ?? null,
    metric_value: payload.metric_value ?? null,
    threshold: payload.threshold ?? null,
  });

  if (error) {
    console.error("performance_alert insert failed:", error.message ?? error);
  }
}
