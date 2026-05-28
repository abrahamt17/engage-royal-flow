export type CreatorRiskLevel = "low" | "medium" | "high";

export const getRiskLevel = (score: number | null | undefined): CreatorRiskLevel => {
  if (!score || score < 20) return "low";
  if (score < 50) return "medium";
  return "high";
};

export const normalizePlatform = (platform: string) => {
  const normalized = platform.toLowerCase().replace(/\s*\/\s*/g, "/").trim();
  return normalized === "x/twitter" ? "twitter" : normalized;
};

export const creatorMatchesPlatform = (
  creatorPlatforms: string[] | null | undefined,
  selectedPlatform: string,
) => {
  if (selectedPlatform === "all") return true;

  const selected = normalizePlatform(selectedPlatform);
  return (creatorPlatforms ?? []).some((platform) => normalizePlatform(platform) === selected);
};

export const getTrustLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
};

export const clampScore = (score: number) => Math.min(Math.max(score, 0), 100);
