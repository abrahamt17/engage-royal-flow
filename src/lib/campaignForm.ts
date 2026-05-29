export type CampaignFormValues = {
  brandId: string | null;
  name: string;
  budget: string;
  platforms: string[];
  contentType: string;
  startDate: string;
  endDate: string;
  basePay: string;
  multiplier: string;
  conversionBonus: string;
  ageRange: string;
  genders: string;
  countries: string;
};

const parseAmount = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseCountries = (value: string) =>
  value
    .split(",")
    .map((country) => country.trim())
    .filter(Boolean);

export const buildCampaignInsert = (values: CampaignFormValues) => {
  const name = values.name.trim();
  const budget = parseAmount(values.budget, 0);
  const basePay = parseAmount(values.basePay, 500);
  const multiplier = parseAmount(values.multiplier, 2.5);
  const conversionBonus = parseAmount(values.conversionBonus, 0);
  const countries = parseCountries(values.countries);

  if (!values.brandId) {
    throw new Error("Your brand profile is still being prepared. Please try again in a moment.");
  }

  if (!name) {
    throw new Error("Campaign name is required.");
  }

  if (budget <= 0) {
    throw new Error("Campaign budget must be greater than 0.");
  }

  if (values.platforms.length === 0) {
    throw new Error("Select at least one platform.");
  }

  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    throw new Error("End date must be on or after the start date.");
  }

  if (basePay < 0 || multiplier <= 0 || conversionBonus < 0) {
    throw new Error("Payroll values must be valid positive amounts.");
  }

  if (countries.length === 0) {
    throw new Error("Enter at least one target country.");
  }

  return {
    brand_id: values.brandId,
    name,
    budget,
    platforms: values.platforms,
    content_type: values.contentType,
    start_date: values.startDate || null,
    end_date: values.endDate || null,
    target_audience: {
      age_range: values.ageRange,
      genders: values.genders,
      countries,
    },
    payroll_formula: {
      base_pay: basePay,
      performance_multiplier: multiplier,
      conversion_bonus: conversionBonus,
      audience_match_weight: 1.0,
    },
  };
};
