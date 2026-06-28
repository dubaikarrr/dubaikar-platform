import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Wallet,
  Users,
  BookOpen,
  Home,
  Sparkles,
  Settings,
  MapPinned,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Not yet built, routes to a placeholder. */
  soon?: boolean;
  /** Shown in the mobile bottom tab bar. */
  mobile?: boolean;
  /** Only shown when the current user is in ADMIN_EMAILS. */
  adminOnly?: boolean;
}

/** Sidebar order per SPEC §6. */
export const NAV_LINKS: NavLink[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/app/jobs", label: "Jobs", icon: Briefcase, soon: true, mobile: true },
  { href: "/app/resume", label: "Resume", icon: FileText, mobile: true },
  { href: "/app/budget", label: "Budget", icon: Wallet },
  { href: "/app/map", label: "Explore Dubai", icon: MapPinned },
  { href: "/app/community", label: "Community", icon: Users, mobile: true },
  { href: "/app/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/app/housing", label: "Housing", icon: Home },
  { href: "/app/services", label: "Services", icon: Sparkles, soon: true },
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];
