import type { Metadata } from "next";
import { OfferTool } from "@/components/tools/offer-tool";

export const metadata: Metadata = {
  title: "Dubai job offer evaluator",
  description: "Evaluate a UAE job offer, total package, gratuity, and red flags, in AED and INR.",
};

export default function PublicOfferPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-text">Dubai job offer evaluator</h1>
      <p className="mt-1 max-w-2xl text-text-muted">
        See your real monthly and annual package, estimate end-of-service
        gratuity, and catch common red flags before you sign.
      </p>
      <div className="mt-8">
        <OfferTool />
      </div>
    </div>
  );
}
