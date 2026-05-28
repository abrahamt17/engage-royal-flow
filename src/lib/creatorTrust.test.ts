import { describe, expect, it } from "vitest";
import { clampScore, creatorMatchesPlatform, getRiskLevel, getTrustLabel } from "./creatorTrust";

describe("creator trust helpers", () => {
  it("classifies fraud risk levels from scores", () => {
    expect(getRiskLevel(null)).toBe("low");
    expect(getRiskLevel(19)).toBe("low");
    expect(getRiskLevel(20)).toBe("medium");
    expect(getRiskLevel(49)).toBe("medium");
    expect(getRiskLevel(50)).toBe("high");
  });

  it("matches platform filters regardless of casing", () => {
    expect(creatorMatchesPlatform(["tiktok", "youtube"], "TikTok")).toBe(true);
    expect(creatorMatchesPlatform(["twitter"], "X / Twitter")).toBe(true);
    expect(creatorMatchesPlatform(["instagram"], "all")).toBe(true);
  });

  it("labels and clamps trust scores", () => {
    expect(getTrustLabel(90)).toBe("Excellent");
    expect(getTrustLabel(70)).toBe("Good");
    expect(getTrustLabel(50)).toBe("Fair");
    expect(getTrustLabel(20)).toBe("Low");
    expect(clampScore(125)).toBe(100);
    expect(clampScore(-10)).toBe(0);
  });
});
