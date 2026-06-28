import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";

export const metadata: Metadata = { title: "Jobs" };

export default function JobsPage() {
  return (
    <ComingSoon
      title="Jobs"
      description="A curated feed of Dubai roles with visa-sponsorship filters and an application tracker is on the way (Phase 2)."
    />
  );
}
