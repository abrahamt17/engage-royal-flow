import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

  const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function createPayPalBatchPayout(
  accessToken: string,
  batchId: string,
  items: Array<{ email: string; amount: string; currency: string; note: string; payrollId: string }>
) {
  const res = await fetch("https://api-m.sandbox.paypal.com/v1/payments/payouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: "You have a payment from CreatorPay",
        email_message: "Your creator payment has been processed.",
      },
      items: items.map((item) => ({
        recipient_type: "EMAIL",
        amount: { value: item.amount, currency: item.currency },
        receiver: item.email,
        note: item.note,
        sender_item_id: item.payrollId,
      })),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal payout failed: ${JSON.stringify(data)}`);
  return data;
}

// Simple exchange rates (in production, use a real FX API)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53, USD: 1 },
  EUR: { USD: 1.09, GBP: 0.86, CAD: 1.48, AUD: 1.66, EUR: 1 },
  GBP: { USD: 1.27, EUR: 1.16, CAD: 1.72, AUD: 1.93, GBP: 1 },
};

function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const rate = EXCHANGE_RATES[from]?.[to] ?? 1;
  return Math.round(amount * rate * 100) / 100;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, batchId, payrollIds, paymentMethod, scheduledFor, brandId } = await req.json();

    // Action: create_batch — group selected payroll items into a batch
    if (action === "create_batch") {
      if (!payrollIds?.length || !brandId) {
        return new Response(JSON.stringify({ error: "payrollIds and brandId required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const batchNumber = `BATCH-${Date.now()}`;
      const { data: payrollItems } = await supabaseAdmin
        .from("payroll")
        .select("*, campaign_creators(*, creators(*))")
        .in("id", payrollIds);

      const totalAmount = payrollItems?.reduce((s: number, p: any) => s + p.total_payment, 0) ?? 0;

      const { data: batch, error } = await supabaseAdmin
        .from("payout_batches")
        .insert({
          brand_id: brandId,
          batch_number: batchNumber,
          total_amount: totalAmount,
          creator_count: payrollItems?.length ?? 0,
          payment_method: paymentMethod ?? "paypal",
          status: scheduledFor ? "scheduled" : "draft",
          scheduled_for: scheduledFor ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      // Link payroll records to batch
      await supabaseAdmin
        .from("payroll")
        .update({ batch_id: batch.id, payment_method: paymentMethod ?? "paypal" })
        .in("id", payrollIds);

      return new Response(JSON.stringify({ batch }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: process_batch — execute PayPal payouts for a batch
    if (action === "process_batch") {
      if (!batchId) {
        return new Response(JSON.stringify({ error: "batchId required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update batch status
      await supabaseAdmin
        .from("payout_batches")
        .update({ status: "processing" })
        .eq("id", batchId);

      // Get payroll items in this batch with creator payment profiles
      const { data: payrollItems } = await supabaseAdmin
        .from("payroll")
        .select("*, campaign_creators(*, creators(*, creator_payment_profiles(*)))")
        .eq("batch_id", batchId);

      if (!payrollItems?.length) {
        throw new Error("No payroll items in batch");
      }

      const { data: batch } = await supabaseAdmin
        .from("payout_batches")
        .select("*")
        .eq("id", batchId)
        .single();

      let successCount = 0;
      let failureCount = 0;

      if (batch?.payment_method === "paypal") {
        try {
          const accessToken = await getPayPalAccessToken();
          const paypalItems = payrollItems
            .map((p: any) => {
              const profile = p.campaign_creators?.creators?.creator_payment_profiles?.[0];
              const email = profile?.paypal_email;
              if (!email) return null;

              const targetCurrency = profile?.preferred_currency ?? p.currency;
              const convertedAmount = convertCurrency(p.total_payment, p.currency, targetCurrency);

              return {
                email,
                amount: convertedAmount.toFixed(2),
                currency: targetCurrency,
                note: `Payment for campaign content`,
                payrollId: p.id,
              };
            })
            .filter(Boolean);

          if (paypalItems.length > 0) {
            const result = await createPayPalBatchPayout(
              accessToken,
              batch.batch_number,
              paypalItems as any
            );

            // Update batch with PayPal batch ID
            await supabaseAdmin
              .from("payout_batches")
              .update({ paypal_batch_id: result.batch_header?.payout_batch_id })
              .eq("id", batchId);

            successCount = paypalItems.length;
          }

          // Mark items without email as failed
          failureCount = payrollItems.length - paypalItems.length;

          // Update individual payroll statuses
          for (const item of payrollItems) {
            const profile = (item as any).campaign_creators?.creators?.creator_payment_profiles?.[0];
            const hasEmail = !!profile?.paypal_email;
            const targetCurrency = profile?.preferred_currency ?? item.currency;
            const convertedAmount = convertCurrency(item.total_payment, item.currency, targetCurrency);

            await supabaseAdmin
              .from("payroll")
              .update({
                status: hasEmail ? "processing" : "failed",
                payment_reference: result?.batch_header?.payout_batch_id,
                converted_amount: convertedAmount,
                converted_currency: targetCurrency,
              })
              .eq("id", item.id);
          }
        } catch (err) {
          failureCount = payrollItems.length;
          await supabaseAdmin
            .from("payout_batches")
            .update({ status: "failed" })
            .eq("id", batchId);
          throw err;
        }
      } else {
        // For non-PayPal methods, mark as processing (manual confirmation needed)
        for (const item of payrollItems) {
          const profile = (item as any).campaign_creators?.creators?.creator_payment_profiles?.[0];
          const targetCurrency = profile?.preferred_currency ?? item.currency;
          const convertedAmount = convertCurrency(item.total_payment, item.currency, targetCurrency);

          await supabaseAdmin
            .from("payroll")
            .update({
              status: "processing",
              converted_amount: convertedAmount,
              converted_currency: targetCurrency,
            })
            .eq("id", item.id);
        }
        successCount = payrollItems.length;
      }

      // Update batch final status
      await supabaseAdmin
        .from("payout_batches")
        .update({
          status: failureCount === payrollItems.length ? "failed" : "completed",
          processed_at: new Date().toISOString(),
          success_count: successCount,
          failure_count: failureCount,
        })
        .eq("id", batchId);

      return new Response(JSON.stringify({ success: true, successCount, failureCount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: fund_escrow — create escrow for a campaign
    if (action === "fund_escrow") {
      const { campaignId, amount, currency } = await req.json();
      const { data, error } = await supabaseAdmin
        .from("campaign_escrow")
        .insert({ campaign_id: campaignId, amount, currency: currency ?? "USD" })
        .select()
        .single();
      if (error) throw error;

      return new Response(JSON.stringify({ escrow: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: release_escrow — release funds from escrow
    if (action === "release_escrow") {
      const { escrowId, releaseAmount } = await req.json();
      const { data: escrow } = await supabaseAdmin
        .from("campaign_escrow")
        .select("*")
        .eq("id", escrowId)
        .single();

      if (!escrow) throw new Error("Escrow not found");

      const newReleased = (escrow.released_amount ?? 0) + releaseAmount;
      const newStatus = newReleased >= escrow.amount ? "fully_released" : "partially_released";

      const { error } = await supabaseAdmin
        .from("campaign_escrow")
        .update({ released_amount: newReleased, status: newStatus })
        .eq("id", escrowId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, released: newReleased, status: newStatus }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("process-payouts error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});