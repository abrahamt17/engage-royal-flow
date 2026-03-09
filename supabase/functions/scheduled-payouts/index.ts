import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find all scheduled batches that are due
    const now = new Date().toISOString();
    const { data: dueBatches, error } = await supabaseAdmin
      .from("payout_batches")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_for", now);

    if (error) throw error;
    if (!dueBatches?.length) {
      return new Response(JSON.stringify({ message: "No batches due", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const batch of dueBatches) {
      try {
        // Update to processing
        await supabaseAdmin
          .from("payout_batches")
          .update({ status: "processing" })
          .eq("id", batch.id);

        // Get payroll items
        const { data: payrollItems } = await supabaseAdmin
          .from("payroll")
          .select("*, campaign_creators(*, creators(*, creator_payment_profiles(*)))")
          .eq("batch_id", batch.id);

        if (!payrollItems?.length) {
          await supabaseAdmin
            .from("payout_batches")
            .update({ status: "failed", processed_at: now })
            .eq("id", batch.id);
          results.push({ batchId: batch.id, status: "failed", reason: "No items" });
          continue;
        }

        let successCount = 0;
        let failureCount = 0;

        // For PayPal batches, attempt PayPal payout
        if (batch.payment_method === "paypal") {
          const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
          const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

          if (clientId && clientSecret) {
            try {
              // Get access token
              const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
                method: "POST",
                headers: {
                  Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
              });
              const tokenData = await tokenRes.json();

              if (tokenRes.ok) {
                const paypalItems = payrollItems
                  .map((p: any) => {
                    const profile = p.campaign_creators?.creators?.creator_payment_profiles?.[0];
                    if (!profile?.paypal_email) return null;
                    return {
                      recipient_type: "EMAIL",
                      amount: { value: p.total_payment.toFixed(2), currency: profile.preferred_currency ?? p.currency },
                      receiver: profile.paypal_email,
                      note: "Scheduled payment from CreatorPay",
                      sender_item_id: p.id,
                    };
                  })
                  .filter(Boolean);

                if (paypalItems.length > 0) {
                  const payoutRes = await fetch("https://api-m.sandbox.paypal.com/v1/payments/payouts", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${tokenData.access_token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      sender_batch_header: {
                        sender_batch_id: batch.batch_number,
                        email_subject: "Your payment from CreatorPay",
                      },
                      items: paypalItems,
                    }),
                  });
                  const payoutData = await payoutRes.json();
                  
                  if (payoutRes.ok) {
                    successCount = paypalItems.length;
                    await supabaseAdmin
                      .from("payout_batches")
                      .update({ paypal_batch_id: payoutData.batch_header?.payout_batch_id })
                      .eq("id", batch.id);
                  }
                }
                failureCount = payrollItems.length - successCount;
              }
            } catch (paypalErr) {
              console.error("PayPal error for batch", batch.id, paypalErr);
              failureCount = payrollItems.length;
            }
          } else {
            // No PayPal credentials - mark as processing for manual handling
            successCount = payrollItems.length;
          }
        } else {
          // Non-PayPal: mark all as processing
          successCount = payrollItems.length;
        }

        // Update payroll items
        for (const item of payrollItems) {
          await supabaseAdmin
            .from("payroll")
            .update({ status: successCount > 0 ? "processing" : "failed" })
            .eq("id", item.id);
        }

        // Finalize batch
        await supabaseAdmin
          .from("payout_batches")
          .update({
            status: failureCount === payrollItems.length ? "failed" : "completed",
            processed_at: now,
            success_count: successCount,
            failure_count: failureCount,
          })
          .eq("id", batch.id);

        results.push({ batchId: batch.id, status: "processed", successCount, failureCount });
      } catch (batchErr: any) {
        await supabaseAdmin
          .from("payout_batches")
          .update({ status: "failed", processed_at: now })
          .eq("id", batch.id);
        results.push({ batchId: batch.id, status: "failed", reason: batchErr.message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("scheduled-payouts error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});