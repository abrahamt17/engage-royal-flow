import { describe, expect, it } from "vitest";
import { buildCampaignInsert, type CampaignFormValues } from "./campaignForm";

const baseValues: CampaignFormValues = {
  brandId: "brand-1",
  name: "Summer Launch",
  budget: "10000",
  platforms: ["TikTok", "Instagram"],
  contentType: "video",
  startDate: "2026-06-01",
  endDate: "2026-06-30",
  basePay: "500",
  multiplier: "2.5",
  conversionBonus: "100",
  ageRange: "18-34",
  genders: "all",
  countries: "US, CA, UK",
};

describe("campaign form builder", () => {
  it("builds a campaign insert payload", () => {
    expect(buildCampaignInsert(baseValues)).toEqual({
      brand_id: "brand-1",
      name: "Summer Launch",
      budget: 10000,
      platforms: ["TikTok", "Instagram"],
      content_type: "video",
      start_date: "2026-06-01",
      end_date: "2026-06-30",
      target_audience: {
        age_range: "18-34",
        genders: "all",
        countries: ["US", "CA", "UK"],
      },
      payroll_formula: {
        base_pay: 500,
        performance_multiplier: 2.5,
        conversion_bonus: 100,
        audience_match_weight: 1.0,
      },
    });
  });

  it("requires brand, budget, platform, and valid dates", () => {
    expect(() => buildCampaignInsert({ ...baseValues, brandId: null })).toThrow("brand profile");
    expect(() => buildCampaignInsert({ ...baseValues, budget: "0" })).toThrow("budget");
    expect(() => buildCampaignInsert({ ...baseValues, platforms: [] })).toThrow("platform");
    expect(() => buildCampaignInsert({ ...baseValues, endDate: "2026-05-31" })).toThrow("End date");
  });

  it("cleans optional date and country values", () => {
    const payload = buildCampaignInsert({
      ...baseValues,
      startDate: "",
      endDate: "",
      countries: "US, , ET ",
    });

    expect(payload.start_date).toBeNull();
    expect(payload.end_date).toBeNull();
    expect(payload.target_audience.countries).toEqual(["US", "ET"]);
  });
});
