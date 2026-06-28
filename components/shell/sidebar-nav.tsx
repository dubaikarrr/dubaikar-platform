"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";
import { NavItem } from "@/components/shell/nav-item";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/** Collapses to an icon rail inside the resume editor (/app/resume/<id>). */
export function SidebarNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const collapsed = /^\/app\/resume\/[^/]+/.test(pathname);
  const links = NAV_LINKS.filter((l) => !l.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface md:flex transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("flex h-16 items-center", collapsed ? "justify-center px-0" : "px-5")}>
        <Link href="/app" aria-label="Dubaikar home">
          {collapsed ? (
            <span className="text-lg font-medium text-brand">D</span>
          ) : (
            <Logo />
          )}
        </Link>
      </div>
      <nav className="app-scroll flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {links.map((link) => (
          <NavItem key={link.href} link={link} collapsed={collapsed} />
        ))}
      </nav>
      {!collapsed ? (
        <div className="border-t border-border p-3 text-xs text-text-subtle">
          Built by CAs Sanket &amp; Shivam
        </div>
      ) : null}
    </aside>
  );
}
