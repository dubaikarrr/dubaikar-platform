import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            Your move to Dubai, step by step. Built by Chartered Accountants
            Sanket &amp; Shivam.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium text-text">Tools</p>
          <ul className="space-y-1 text-text-muted">
            <li><Link href="/tools/budget" className="hover:text-text">Budget calculator</Link></li>
            <li><Link href="/tools/resume" className="hover:text-text">Resume builder</Link></li>
            <li><Link href="/tools/metro" className="hover:text-text">Metro calculator</Link></li>
            <li><Link href="/tools/offer-evaluator" className="hover:text-text">Offer evaluator</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium text-text">Company</p>
          <ul className="space-y-1 text-text-muted">
            <li><Link href="/blog" className="hover:text-text">Guides</Link></li>
            <li><Link href="/privacy" className="hover:text-text">Privacy</Link></li>
            <li><Link href="/login" className="hover:text-text">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-text-subtle">
        © {new Date().getFullYear()} Dubaikar. All rights reserved.
      </div>
    </footer>
  );
}
