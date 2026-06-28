"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { NotificationsMenu } from "@/components/shell/notifications-menu";
import { NAV_LINKS } from "@/lib/nav";
import { NavItem } from "@/components/shell/nav-item";
import { STAGE_META, type Stage } from "@/lib/journey";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";

interface TopBarProps {
  name?: string | null;
  stage: Stage;
  avatarUrl?: string | null;
}

export function TopBar({ name, stage, avatarUrl }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur md:px-6">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] text-text-muted hover:bg-surface-2 md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/app" className="md:hidden" aria-label="Dubaikar home">
          <Logo />
        </Link>

        <div className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <input
            type="search"
            placeholder="Search Dubaikar"
            className="h-9 w-full rounded-[var(--radius-control)] border border-border bg-surface-2 pl-9 pr-3 text-sm text-text placeholder:text-text-subtle focus-visible:outline-2 focus-visible:outline-brand"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Stage pill stays visible on every screen (SPEC §7 responsive). */}
          <Badge tone="brand" className="hidden sm:inline-flex">
            {STAGE_META[stage].label}
          </Badge>
          <ThemeToggle />
          <NotificationsMenu />
          <Link href="/app/settings" aria-label="Your profile">
            <Avatar name={name} src={avatarUrl} size={32} />
          </Link>
        </div>
      </header>

      {/* Mobile slide-over with the full nav */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] text-text-muted hover:bg-surface-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav
              className="space-y-1"
              onClick={() => setMenuOpen(false)}
            >
              {NAV_LINKS.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
