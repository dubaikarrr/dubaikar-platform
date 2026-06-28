import type { Metadata } from "next";
import { BudgetTool } from "@/components/tools/budget-tool";

export const metadata: Metadata = {
  title: "Dubai move-in budget calculator",
  description: "Estimate the one-time and monthly cost of moving to Dubai from India, in AED and INR.",
};

export default function PublicBudgetPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-text">Dubai move-in budget calculator</h1>
      <p className="mt-1 max-w-2xl text-text-muted">
        Plan what you need to land, settle, and live in Dubai for your first
        couple of months, in AED and INR. Free, no sign-up needed.
      </p>
      <div className="mt-8">
        <BudgetTool />
      </div>
    </div>
  );
}
