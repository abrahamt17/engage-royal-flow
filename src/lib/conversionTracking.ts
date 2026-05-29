export type TrackingType = "utm" | "promo" | "affiliate" | "pixel";

export type TrackingFormValues = {
  campaignId: string;
  creatorId: string;
  trackingType: string;
  trackingCode: string;
};

export type ConversionTrackingRow = {
  id: string;
  campaign_id: string;
  tracking_code: string;
  tracking_type: string;
  clicks?: number | null;
  conversions?: number | null;
  revenue?: number | null;
  campaigns?: {
    spent?: number | null;
  } | null;
};

const trackingTypes = new Set<TrackingType>(["utm", "promo", "affiliate", "pixel"]);

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const buildTrackingInsert = (values: TrackingFormValues) => {
  const campaignId = values.campaignId.trim();
  const creatorId = values.creatorId === "none" ? "" : values.creatorId.trim();
  const trackingCode = values.trackingCode.trim();
  const trackingType = values.trackingType as TrackingType;

  if (!campaignId) {
    throw new Error("Select a campaign.");
  }

  if (!trackingTypes.has(trackingType)) {
    throw new Error("Select a valid tracking type.");
  }

  if (!trackingCode) {
    throw new Error("Tracking code or URL is required.");
  }

  if (trackingType === "utm" && !isValidUrl(trackingCode)) {
    throw new Error("UTM tracking must be a valid http or https URL.");
  }

  return {
    campaign_id: campaignId,
    creator_id: creatorId || null,
    tracking_type: trackingType,
    tracking_code: trackingCode,
  };
};

export const calculateConversionMetrics = (trackingCodes: ConversionTrackingRow[]) => {
  const campaignClicks = trackingCodes.reduce<Record<string, number>>((acc, code) => {
    acc[code.campaign_id] = (acc[code.campaign_id] ?? 0) + (code.clicks ?? 0);
    return acc;
  }, {});

  const rows = trackingCodes.map((code) => {
    const clicks = code.clicks ?? 0;
    const conversions = code.conversions ?? 0;
    const revenue = code.revenue ?? 0;
    const campaignSpend = code.campaigns?.spent ?? 0;
    const totalCampaignClicks = campaignClicks[code.campaign_id] ?? 0;
    const attributedSpend = totalCampaignClicks > 0
      ? campaignSpend * (clicks / totalCampaignClicks)
      : 0;

    return {
      id: code.id,
      attributedSpend,
      cpa: conversions > 0 && attributedSpend > 0 ? attributedSpend / conversions : null,
      roas: attributedSpend > 0 ? revenue / attributedSpend : null,
    };
  });

  const totals = rows.reduce(
    (acc, row) => {
      acc.attributedSpend += row.attributedSpend;
      return acc;
    },
    { attributedSpend: 0 },
  );

  const totalClicks = trackingCodes.reduce((sum, code) => sum + (code.clicks ?? 0), 0);
  const totalConversions = trackingCodes.reduce((sum, code) => sum + (code.conversions ?? 0), 0);
  const totalRevenue = trackingCodes.reduce((sum, code) => sum + (code.revenue ?? 0), 0);

  return {
    totalClicks,
    totalConversions,
    totalRevenue,
    attributedSpend: totals.attributedSpend,
    avgCPA: totalConversions > 0 && totals.attributedSpend > 0
      ? totals.attributedSpend / totalConversions
      : null,
    roas: totals.attributedSpend > 0 ? totalRevenue / totals.attributedSpend : null,
    rows,
  };
};
