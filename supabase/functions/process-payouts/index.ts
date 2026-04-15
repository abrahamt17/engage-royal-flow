import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPPORTED_PAYMENT_METHODS = new Set(["paypal", "wise", "bank_transfer", "stripe"]);
const MANUAL_PAYMENT_METHODS = new Set(["wise", "bank_transfer", "stripe"]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getPayPalBaseUrl = () => {
  const mode = (Deno.env.get("PAYPAL_ENV") ?? "sandbox").toLowerCase();
  return mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
};

const parseFxRates = () => {
  const raw = Deno.env.get("FX_RATES_JSON");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, Record<string, number>>;
  } catch {
    throw new Error("FX_RATES_JSON is not valid JSON");
  }
};

const convertCurrency = (
  amount: number,
  from: string,
  to: string,
  fxRates: Record<string, Record<string, number>> | null,
) => {
  if (from === to) return amount;

  const rate = fxRates?.[from]?.[to];
  if (!rate) {
    throw new Error(`Missing FX rate for ${from} to ${to}. Configure FX_RATES_JSON.`);
  }

  return Math.round(amount * rate * 100) / 100;
};

async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  }

  return data.access_token as string;
}

async function createPayPalBatchPayout(
  accessToken: string,
  batchNumber: string,
  items: Array<{ email: string; amount: string; currency: string; note: string; payrollId: string }>,
) {
  const res = await fetch(`${getPayPalBaseUrl()}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: batchNumber,
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
  if (!res.ok) {
    throw new Error(`PayPal payout failed: ${JSON.stringify(data)}`);
  }

  return data;
}

const getManualReference = (paymentMethod: string, batchNumber: string, payrollId: string) =>
  `manual-${paymentMethod}-${batchNumber}-${payrollId}`;

type PayrollItem = {
  id: string;
  total_payment: number;
  currency: string;
  campaign_creators?: {
    creators?: {
      creator_payment_profiles?: Array<{
        payment_method?: string | null;
        preferred_currency?: string | null;
        paypal_email?: string | null;
        wise_email?: string | null;
        bank_name?: string | null;
        bank_account_number?: string | null;
        bank_routing_number?: string | null;
      }> | null;
    } | null;
  } | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing Authorization bearer token" }, 401);
  }

  try {
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const isInternalRequest = bearerToken === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!isInternalRequest) {
      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );

      const {
        data: { user },
        error: userError,
      } = await supabaseUser.auth.getUser();

      if (userError || !user) {
        return json({ error: "Invalid or expired user token" }, 401);
      }
    }

    const payload = await req.json();
    const { action, batchId, payrollIds, paymentMethod, scheduledFor, brandId } = payload;
    const fxRates = parseFxRates();

    if (action === "create_batch") {
      if (!Array.isArray(payrollIds) || payrollIds.length === 0 || !brandId) {
        return json({ error: "payrollIds and brandId required" }, 400);
      }

      const selectedMethod = paymentMethod ?? "paypal";
      if (!SUPPORTED_PAYMENT_METHODS.has(selectedMethod)) {
        return json({ error: `Unsupported payment method: ${selectedMethod}` }, 400);
      }

      const batchNumber = `BATCH-${Date.now()}`;
      const { data: payrollItems, error: payrollError } = await supabaseAdmin
        .from("payroll")
        .select("id, total_payment, status")
        .in("id", payrollIds);

      if (payrollError) throw payrollError;

      const totalAmount = payrollItems?.reduce((sum: number, item: { total_payment: number }) => sum + item.total_payment, 0) ?? 0;
      const notes = MANUAL_PAYMENT_METHODS.has(selectedMethod)
        ? `Manual payout workflow required for ${selectedMethod}. No automated rail is configured in this environment.`
        : null;

      const { data: batch, error } = await supabaseAdmin
        .from("payout_batches")
        .insert({
          brand_id: brandId,
          batch_number: batchNumber,
          total_amount: totalAmount,
          creator_count: payrollItems?.length ?? 0,
          payment_method: selectedMethod,
          status: scheduledFor ? "scheduled" : "draft",
          scheduled_for: scheduledFor ?? null,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      await supabaseAdmin
        .from("payroll")
        .update({ batch_id: batch.id, payment_method: selectedMethod })
        .in("id", payrollIds);

      return json({
        batch,
        executionMode: MANUAL_PAYMENT_METHODS.has(selectedMethod) ? "manual" : "automated",
      });
    }

    if (action === "process_batch") {
      if (!batchId) {
        return json({ error: "batchId required" }, 400);
      }

      await supabaseAdmin
        .from("payout_batches")
        .update({ status: "processing" })
        .eq("id", batchId);

      const { data: batch, error: batchError } = await supabaseAdmin
        .from("payout_batches")
        .select("*")
        .eq("id", batchId)
        .single();

      if (batchError) throw batchError;

      const { data: payrollItems, error: payrollError } = await supabaseAdmin
        .from("payroll")
        .select("*, campaign_creators(*, creators(*, creator_payment_profiles(*)))")
        .eq("batch_id", batchId);

      if (payrollError) throw payrollError;
      if (!payrollItems?.length) {
        throw new Error("No payroll items in batch");
      }

      let successCount = 0;
      let failureCount = 0;
      let manualCount = 0;

      if (batch.payment_method === "paypal") {
        try {
          const accessToken = await getPayPalAccessToken();

          const paypalItems = payrollItems
            .map((item: PayrollItem) => {
              const profile = item.campaign_creators?.creators?.creator_payment_profiles?.[0];
              const email = profile?.paypal_email;
              if (!email) return null;

              const targetCurrency = profile?.preferred_currency ?? item.currency;
              const convertedAmount = convertCurrency(item.total_payment, item.currency, targetCurrency, fxRates);

              return {
                payrollId: item.id,
                email,
                amount: convertedAmount.toFixed(2),
                currency: targetCurrency,
                note: "Payment for campaign content",
              };
            })
            .filter(Boolean) as Array<{ payrollId: string; email: string; amount: string; currency: string; note: string }>;

          if (paypalItems.length === 0) {
            throw new Error("No valid PayPal recipients found in this batch");
          }

          const result = await createPayPalBatchPayout(accessToken, batch.batch_number, paypalItems);

          await supabaseAdmin
            .from("payout_batches")
            .update({
              paypal_batch_id: result.batch_header?.payout_batch_id,
              notes: `Automated PayPal payout submitted via ${getPayPalBaseUrl()}.`,
            })
            .eq("id", batchId);

          for (const item of payrollItems as PayrollItem[]) {
            const profile = item.campaign_creators?.creators?.creator_payment_profiles?.[0];
            const hasEmail = !!profile?.paypal_email;
            const targetCurrency = profile?.preferred_currency ?? item.currency;
            const convertedAmount = convertCurrency(item.total_payment, item.currency, targetCurrency, fxRates);

            await supabaseAdmin
              .from("payroll")
              .update({
                status: hasEmail ? "processing" : "failed",
                payment_reference: hasEmail ? result.batch_header?.payout_batch_id : null,
                converted_amount: convertedAmount,
                converted_currency: targetCurrency,
              })
              .eq("id", item.id);

            if (hasEmail) successCount += 1;
            else failureCount += 1;
          }
        } catch (error) {
          await supabaseAdmin
            .from("payout_batches")
            .update({ status: "failed", notes: error instanceof Error ? error.message : "PayPal processing failed" })
            .eq("id", batchId);
          throw error;
        }
      } else {
        for (const item of payrollItems as PayrollItem[]) {
          const profile = item.campaign_creators?.creators?.creator_payment_profiles?.[0];
          const targetCurrency = profile?.preferred_currency ?? item.currency;
          const convertedAmount = convertCurrency(item.total_payment, item.currency, targetCurrency, fxRates);

          let canRoute = false;
          if (batch.payment_method === "wise") {
            canRoute = !!profile?.wise_email;
          } else if (batch.payment_method === "bank_transfer") {
            canRoute = !!profile?.bank_account_number && !!profile?.bank_routing_number && !!profile?.bank_name;
          } else if (batch.payment_method === "stripe") {
            canRoute = profile?.payment_method === "stripe";
          }

          await supabaseAdmin
            .from("payroll")
            .update({
              status: canRoute ? "processing" : "failed",
              payment_reference: canRoute ? getManualReference(batch.payment_method, batch.batch_number, item.id) : null,
              converted_amount: convertedAmount,
              converted_currency: targetCurrency,
            })
            .eq("id", item.id);

          if (canRoute) {
            successCount += 1;
            manualCount += 1;
          } else {
            failureCount += 1;
          }
        }

        await supabaseAdmin
          .from("payout_batches")
          .update({
            notes: `Manual ${batch.payment_method} payout handoff created. External execution must be completed outside CreatorPay.`,
          })
          .eq("id", batchId);
      }

      await supabaseAdmin
        .from("payout_batches")
        .update({
          status: failureCount === (payrollItems?.length ?? 0) ? "failed" : "completed",
          processed_at: new Date().toISOString(),
          success_count: successCount,
          failure_count: failureCount,
        })
        .eq("id", batchId);

      return json({
        success: true,
        successCount,
        failureCount,
        executionMode: MANUAL_PAYMENT_METHODS.has(batch.payment_method) ? "manual" : "automated",
        manualCount,
      });
    }

    if (action === "fund_escrow") {
      const { campaignId, amount, currency } = payload;
      const { data, error } = await supabaseAdmin
        .from("campaign_escrow")
        .insert({ campaign_id: campaignId, amount, currency: currency ?? "USD" })
        .select()
        .single();

      if (error) throw error;
      return json({ escrow: data });
    }

    if (action === "release_escrow") {
      const { escrowId, releaseAmount } = payload;
      const { data: escrow, error: escrowError } = await supabaseAdmin
        .from("campaign_escrow")
        .select("*")
        .eq("id", escrowId)
        .single();

      if (escrowError) throw escrowError;
      if (!escrow) throw new Error("Escrow not found");

      const newReleased = (escrow.released_amount ?? 0) + releaseAmount;
      const newStatus = newReleased >= escrow.amount ? "fully_released" : "partially_released";

      const { error } = await supabaseAdmin
        .from("campaign_escrow")
        .update({ released_amount: newReleased, status: newStatus })
        .eq("id", escrowId);

      if (error) throw error;
      return json({ success: true, released: newReleased, status: newStatus });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("process-payouts error:", message);
    return json({ error: message }, 500);
  }
});
