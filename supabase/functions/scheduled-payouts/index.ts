import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date().toISOString();
    const { data: dueBatches, error } = await supabaseAdmin
      .from("payout_batches")
      .select("id")
      .eq("status", "scheduled")
      .lte("scheduled_for", now);

    if (error) throw error;
    if (!dueBatches?.length) {
      return json({ message: "No batches due", processed: 0 });
    }

    const processUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-payouts`;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const results = [];

    for (const batch of dueBatches) {
      try {
        const res = await fetch(processUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "process_batch", batchId: batch.id }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error ?? "Scheduled payout processing failed");
        }

        results.push({ batchId: batch.id, status: "processed", ...data });
      } catch (batchError) {
        const message = batchError instanceof Error ? batchError.message : "Unknown scheduled payout error";
        await supabaseAdmin
          .from("payout_batches")
          .update({ status: "failed", processed_at: now, notes: message })
          .eq("id", batch.id);

        results.push({ batchId: batch.id, status: "failed", reason: message });
      }
    }

    return json({ processed: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("scheduled-payouts error:", message);
    return json({ error: message }, 500);
  }
});
