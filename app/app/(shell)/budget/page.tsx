import type { Metadata } from "next";
import { BudgetTool } from "@/components/tools/budget-tool";
import { BudgetHistory } from "@/components/tools/budget-history";
import { listBudgets, getBudget } from "@/lib/actions/budget";
import type { BudgetInputs } from "@/lib/tools/budget";

export const metadata: Metadata = { title: "Budget" };

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ rent?: string; area?: string; load?: string }>;
}) {
  const { rent, area, load } = await searchParams;
  const prefillRent = rent ? Number(rent) : undefined;

  const [budgets, loaded] = await Promise.all([
    listBudgets(),
    load ? getBudget(load) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-text">Move-in budget</h1>
        <p className="text-sm text-text-muted">
          Estimate what you need to land, settle, and live in Dubai. Save it to
          your account or ask the team for help cutting costs.
        </p>
      </div>
      <BudgetTool
        key={load ?? "new"}
        authed
        prefillRent={Number.isFinite(prefillRent) ? prefillRent : undefined}
        prefillArea={area}
        initialInputs={loaded ? (loaded.inputs as unknown as BudgetInputs) : undefined}
        initialTitle={loaded?.title ?? undefined}
      />
      <BudgetHistory budgets={budgets} />
    </div>
  );
}
