/**
 * Currency helpers. The whole app converts AED → INR through this single
 * constant (SPEC §3 / §10). Update it here and every screen updates.
 * The legacy site used the same rate (1 AED = ₹25, Website/index.html:6159).
 */
export const AED_TO_INR = 25;

/** Round and format an AED amount, e.g. `AED 2,500`. */
export function formatAED(amount: number): string {
  return `AED ${Math.round(amount).toLocaleString("en-AE")}`;
}

/** Round and format an INR amount with the Indian grouping, e.g. `₹62,500`. */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Convert an AED amount to INR (rounded). */
export function aedToInr(amountAed: number): number {
  return Math.round(amountAed * AED_TO_INR);
}

/** `AED 2,500  ≈ ₹62,500`, the standard dual-currency label used in tools. */
export function formatAedWithInr(amountAed: number): string {
  return `${formatAED(amountAed)}  ≈ ${formatINR(aedToInr(amountAed))}`;
}

/** Plain rounded number with locale separators (no currency symbol). */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}
