import type { Metadata } from "next";
import { CelebrateScreen } from "@/components/onboarding/celebrate-screen";

export const metadata: Metadata = { title: "Welcome aboard" };

export default async function CelebratePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const first = (name ?? "").split(" ")[0] || "there";
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-soft via-bg to-surface px-4">
      <CelebrateScreen name={first} />
    </div>
  );
}
