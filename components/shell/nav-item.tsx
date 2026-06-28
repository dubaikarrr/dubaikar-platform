"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function NavItem({ link, collapsed }: { link: NavLink; collapsed?: boolean }) {
  const pathname = usePathname();
  const active =
    link.href === "/app" ? pathname === "/app" : pathname.startsWith(link.href);
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? link.label : undefined}
      className={cn(
        "navitem flex items-center rounded-[9px] text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
        active ? "bg-brand-soft text-brand" : "text-text-muted hover:text-text",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed ? (
        <>
          <span className="flex-1">{link.label}</span>
          {link.soon ? (
            <span className="pill" style={{ fontSize: 10, padding: "2px 7px" }}>
              soon
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
}
