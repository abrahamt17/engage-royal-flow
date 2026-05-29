import { describe, expect, it } from "vitest";
import { buildTrackingInsert, calculateConversionMetrics } from "./conversionTracking";

describe("conversion tracking helpers", () => {
  it("builds a normalized tracking insert payload", () => {
    expect(buildTrackingInsert({
      campaignId: " campaign-1 ",
      creatorId: "none",
      trackingType: "promo",
      trackingCode: " SAVE20 ",
    })).toEqual({
      campaign_id: "campaign-1",
      creator_id: null,
      tracking_type: "promo",
      tracking_code: "SAVE20",
    });
  });

  it("validates required fields and UTM urls", () => {
    expect(() => buildTrackingInsert({
      campaignId: "",
      creatorId: "",
      trackingType: "promo",
      trackingCode: "SAVE20",
    })).toThrow("campaign");

    expect(() => buildTrackingInsert({
      campaignId: "campaign-1",
      creatorId: "",
      trackingType: "utm",
      trackingCode: "not-a-url",
    })).toThrow("valid http or https URL");
  });

  it("allocates campaign spend across tracking rows for CPA and ROAS", () => {
    const metrics = calculateConversionMetrics([
      {
        id: "a",
        campaign_id: "campaign-1",
        tracking_code: "A",
        tracking_type: "promo",
        clicks: 75,
        conversions: 3,
        revenue: 600,
        campaigns: { spent: 1000 },
      },
      {
        id: "b",
        campaign_id: "campaign-1",
        tracking_code: "B",
        tracking_type: "affiliate",
        clicks: 25,
        conversions: 1,
        revenue: 250,
        campaigns: { spent: 1000 },
      },
    ]);

    expect(metrics.totalClicks).toBe(100);
    expect(metrics.totalConversions).toBe(4);
    expect(metrics.attributedSpend).toBe(1000);
    expect(metrics.avgCPA).toBe(250);
    expect(metrics.rows.find((row) => row.id === "a")?.attributedSpend).toBe(750);
    expect(metrics.rows.find((row) => row.id === "b")?.roas).toBe(1);
  });
});
