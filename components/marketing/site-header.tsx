import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { WEBINAR_CHECKOUT_URL } from "@/lib/webinar";

export function SiteHeader() {
  const checkout = WEBINAR_CHECKOUT_URL || "#register";
  const external = WEBINAR_CHECKOUT_URL.startsWith("http");
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Dubaikar home">
          <Logo className="text-xl" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-text-muted sm:flex">
          <Link href="/#webinar" className="hover:text-text">Webinar</Link>
          <Link href="/tools/budget" className="hover:text-text">Tools</Link>
          <Link href="/blog" className="hover:text-text">Guides</Link>
          <Link href="/login" className="hover:text-text">Sign in</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/login" size="sm" variant="secondary" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href={checkout} size="sm" {...(external ? { target: "_blank", rel: "noopener" } : {})}>
            Register
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
