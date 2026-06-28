/** Maps journey step_key → the module that completes it (for "next steps"). */
export const STEP_LINKS: Record<string, string> = {
  plan_budget: "/app/budget",
  plan_timeline: "/app/settings",
  plan_reason: "/app/settings",
  prepare_cv: "/app/resume",
  prepare_salary: "/app/settings",
  prepare_docs: "/app/knowledge",
  apply_shortlist: "/app/jobs",
  apply_track: "/app/jobs",
  depart_visa: "/app/services",
  depart_flight: "/app/budget",
  arrive_sim: "/app/knowledge",
  arrive_emirates_id: "/app/knowledge",
  settle_housing: "/app/housing",
  settle_bank: "/app/knowledge",
  settle_community: "/app/community",
};

export function stepHref(stepKey: string): string | undefined {
  return STEP_LINKS[stepKey];
}
