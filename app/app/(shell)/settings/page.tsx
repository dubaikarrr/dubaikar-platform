import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/profile";
import { SettingsForm } from "@/components/settings/settings-form";
import { AccountSection } from "@/components/settings/account-section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await requireOnboardedProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-text">Settings</h1>
        <p className="text-sm text-text-muted">Manage your profile and account.</p>
      </div>

      <SettingsForm profile={profile} />

      <AccountSection name={profile.full_name} avatarUrl={profile.avatar_url ?? null} />

      <form action="/auth/signout" method="post">
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </div>
  );
}
