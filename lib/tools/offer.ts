/**
 * UAE job-offer evaluator. Gratuity follows UAE law: 21 days' basic pay per
 * year for the first 5 years, 30 days' per year thereafter (legacy tool).
 */

export interface OfferInputs {
  basicAed: number;
  housingAed: number;
  transportAed: number;
  otherAed: number;
  years: number; // expected tenure for gratuity projection
}

export const DEFAULT_OFFER_INPUTS: OfferInputs = {
  basicAed: 8000,
  housingAed: 3000,
  transportAed: 1000,
  otherAed: 0,
  years: 3,
};

export interface OfferResult {
  monthlyTotalAed: number;
  annualTotalAed: number;
  gratuityAed: number;
  issues: string[];
}

/** End-of-service gratuity for a given basic salary and tenure (years). */
export function gratuity(basicAed: number, years: number): number {
  const dailyWage = (basicAed * 12) / 365;
  const firstFive = Math.min(years, 5) * 21 * dailyWage;
  const afterFive = Math.max(0, years - 5) * 30 * dailyWage;
  return Math.round(firstFive + afterFive);
}

export function evaluateOffer(inputs: OfferInputs): OfferResult {
  const monthlyTotal =
    inputs.basicAed + inputs.housingAed + inputs.transportAed + inputs.otherAed;
  const annualTotal = monthlyTotal * 12;
  const grat = gratuity(inputs.basicAed, inputs.years);

  const issues: string[] = [];
  // Basic should usually be ≥ 50–60% of total or gratuity suffers.
  if (inputs.basicAed < monthlyTotal * 0.5) {
    issues.push(
      "Your basic salary is under 50% of the package, this lowers your gratuity and leave pay.",
    );
  }
  if (monthlyTotal < 4000) {
    issues.push("This package is below a typical Dubai living wage, check your budget carefully.");
  }
  if (inputs.housingAed === 0) {
    issues.push("No housing allowance, factor rent into your own budget.");
  }

  return {
    monthlyTotalAed: monthlyTotal,
    annualTotalAed: annualTotal,
    gratuityAed: grat,
    issues,
  };
}
