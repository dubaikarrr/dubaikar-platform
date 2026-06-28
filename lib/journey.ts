/**
 * The journey is the spine of the product (SPEC §2). Six stages, each with a
 * default set of steps that get seeded into `journey_steps` on onboarding.
 */

export const STAGES = [
  "plan",
  "prepare",
  "apply",
  "depart",
  "arrive",
  "settle",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_META: Record<
  Stage,
  { label: string; tagline: string }
> = {
  plan: { label: "Plan", tagline: "Decide if and when to move" },
  prepare: { label: "Prepare", tagline: "Budget, CV, and documents ready" },
  apply: { label: "Apply", tagline: "Find and apply to jobs" },
  depart: { label: "Depart", tagline: "Visa, flights, and packing" },
  arrive: { label: "Arrive", tagline: "Land and get set up" },
  settle: { label: "Settle", tagline: "Housing, banking, and community" },
};

/** Default steps seeded per stage. `step_key` is stable; label is for display. */
export const DEFAULT_STEPS: Record<Stage, { key: string; label: string }[]> = {
  plan: [
    { key: "plan_reason", label: "Clarify your reason to move" },
    { key: "plan_budget", label: "Estimate your move-in budget" },
    { key: "plan_timeline", label: "Set a target move date" },
  ],
  prepare: [
    { key: "prepare_cv", label: "Build and ATS-score your CV" },
    { key: "prepare_salary", label: "Set a target salary" },
    { key: "prepare_docs", label: "Gather and attest documents" },
  ],
  apply: [
    { key: "apply_shortlist", label: "Shortlist target roles" },
    { key: "apply_track", label: "Apply and track applications" },
  ],
  depart: [
    { key: "depart_visa", label: "Sort out your visa" },
    { key: "depart_flight", label: "Book your flight" },
  ],
  arrive: [
    { key: "arrive_sim", label: "Get a SIM and transport card" },
    { key: "arrive_emirates_id", label: "Apply for your Emirates ID" },
  ],
  settle: [
    { key: "settle_housing", label: "Find accommodation" },
    { key: "settle_bank", label: "Open a bank account" },
    { key: "settle_community", label: "Connect with the community" },
  ],
};

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}
