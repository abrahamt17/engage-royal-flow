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

export const isActiveFilterValue = (value: string | undefined) =>
  Boolean(value && value !== "all");

export const creatorMatchesCategory = (
  creatorCategory: string | null | undefined,
  selectedCategory: string | undefined,
) => {
  if (!isActiveFilterValue(selectedCategory)) return true;
  return (creatorCategory ?? "").toLowerCase() === selectedCategory!.toLowerCase();
};

export const calculateMarketplaceFitScore = (
  creator: {
    audience_authenticity?: number | null;
    avg_engagement_rate?: number | null;
    category?: string | null;
    trust_score?: number | null;
  },
  selectedCategory?: string,
) => {
  const engagementQuality = clampScore((creator.avg_engagement_rate || 0) * 10) / 100;
  const audienceAuthenticity = clampScore(creator.audience_authenticity ?? 50) / 100;
  const trust = clampScore(creator.trust_score ?? 50) / 100;
  const categoryMatch = creatorMatchesCategory(creator.category, selectedCategory) && isActiveFilterValue(selectedCategory) ? 1 : 0.5;

  return Math.round((0.4 * audienceAuthenticity + 0.25 * categoryMatch + 0.2 * engagementQuality + 0.15 * trust) * 100);
};
