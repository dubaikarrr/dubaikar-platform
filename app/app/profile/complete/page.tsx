import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/profile";
import { Logo } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { ProfileCompleteForm } from "@/components/onboarding/profile-complete-form";

export const metadata: Metadata = { title: "Complete your profile" };

export default async function ProfileCompletePage() {
  const { profile } = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.onboarded) redirect("/app/onboarding");
  // Already complete? Skip straight to the app.
  if (profile.linkedin_url && profile.phone) redirect("/app");

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex h-16 items-center px-6">
        <Logo className="text-xl" />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-8">
        <Card className="w-full max-w-lg p-6 sm:p-8">
          <ProfileCompleteForm
            initialLinkedin={profile.linkedin_url ?? ""}
            initialPhone={profile.phone ?? ""}
          />
        </Card>
      </main>
    </div>
  );
}
