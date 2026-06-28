import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Members only",
  description: "Dubaikar is invite-only. Register for the webinar to get access.",
};

export default function MembersOnlyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex h-16 items-center px-6">
        <Logo className="text-xl" />
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-6 text-2xl font-medium text-text sm:text-3xl">
            Dubaikar is members only
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            The platform is currently open to people who have enrolled in our
            live webinar. Register for the next session to get access to the
            resume builder, budget planner, Dubai map and the community for
            three months.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink
              href="https://superprofile.bio/e/dubaikar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enroll for the webinar
            </ButtonLink>
            <Link href="/" className="text-sm text-text-muted hover:text-text">
              Back to homepage
            </Link>
          </div>
          <p className="mt-8 text-xs text-text-subtle">
            Already a member? Try a different email at <Link href="/login" className="underline">sign in</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
