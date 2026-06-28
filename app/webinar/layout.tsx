import Link from "next/link";
import type { Metadata } from "next";
import { WEBINAR } from "@/lib/webinar";

export const metadata: Metadata = {
  title: `${WEBINAR.title}, Dubaikar webinar`,
  description: WEBINAR.subtitle,
};

/**
 * The webinar landing is always light, it's a public marketing surface and
 * should look the same for everyone, regardless of the visitor's saved theme.
 * Wrapping in data-theme="light" makes the light tokens cascade to the subtree.
 */
export default function WebinarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="light" className="flex min-h-screen flex-col bg-bg text-text">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="text-lg font-semibold">
            <span className="text-brand">Dubai</span>
            <span className="text-brand-ink">kar</span>
          </Link>
          <a href="#register" className="btn btn-primary btn-sm">Register · ₹{WEBINAR.priceInr}</a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-text-muted">
          © {WEBINAR.hostLabel.replace("Hosted by ", "")} · Dubaikar ·{" "}
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
