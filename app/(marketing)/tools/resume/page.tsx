import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dubai resume builder with ATS scoring",
  description: "Build a Dubai-ready CV with UAE-specific fields and an instant ATS score out of 100. Free with a Dubaikar account.",
};

const FEATURES = [
  "UAE-specific fields (visa status, notice period, nationality)",
  "Instant ATS score out of 100",
  "Multiple ATS-friendly templates",
  "Live preview and one-click PDF download",
];

export default function PublicResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-text">Dubai resume builder</h1>
      <p className="mx-auto mt-2 max-w-xl text-text-muted">
        Build a CV tuned for the Dubai job market and get an ATS score before you
        apply. Sign in to save your work (access is invite-only).
      </p>

      <Card className="mx-auto mt-8 max-w-md text-left">
        <CardBody className="space-y-3">
          {FEATURES.map((f) => (
            <p key={f} className="flex items-center gap-2 text-sm text-text">
              <Check className="h-4 w-4 shrink-0 text-success" /> {f}
            </p>
          ))}
        </CardBody>
      </Card>

      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/login" size="lg">Sign in to build my CV</ButtonLink>
      </div>
    </div>
  );
}
