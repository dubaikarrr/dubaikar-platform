import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { requireOnboardedProfile } from "@/lib/profile";
import { isAdminEmail } from "@/lib/auth/admin";

/** Wraps every authed module in the TopBar + Sidebar shell. */
export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireOnboardedProfile();
  // After onboarding, LinkedIn + phone are required to unlock the app.
  if (!profile.linkedin_url || !profile.phone) {
    redirect("/app/profile/complete");
  }
  const isAdmin = isAdminEmail(profile.email);
  return (
    <AppShell
      name={profile.full_name}
      stage={profile.current_stage}
      avatarUrl={profile.avatar_url ?? null}
      isAdmin={isAdmin}
    >
      {children}
    </AppShell>
  );
}
