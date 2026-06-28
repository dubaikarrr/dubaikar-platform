import type { Metadata } from "next";
import { MetroTool } from "@/components/tools/metro-tool";

export const metadata: Metadata = {
  title: "Dubai Metro pass calculator",
  description: "Compare pay-per-ride vs 30-day and 90-day Nol passes for your Dubai Metro commute.",
};

export default function PublicMetroPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-text">Dubai Metro pass calculator</h1>
      <p className="mt-1 max-w-2xl text-text-muted">
        Find your cheapest commute, pay-per-ride vs a 30-day or 90-day pass,
        based on your stations and how often you travel.
      </p>
      <div className="mt-8">
        <MetroTool />
      </div>
    </div>
  );
}
