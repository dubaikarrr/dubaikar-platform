import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/profile";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = { title: "Get started" };

export default async function OnboardingPage() {
  const { profile } = await getCurrentProfile();
  if (profile?.onboarded) redirect("/app");

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex h-16 items-center px-6">
        <Logo className="text-xl" />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-8">
        <Card className="w-full max-w-lg p-6 sm:p-8">
          <OnboardingWizard defaultName={profile?.full_name ?? ""} />
        </Card>
      </main>
    </div>
  );
}
