import { SidebarNav } from "@/components/shell/sidebar-nav";
import { TopBar } from "@/components/shell/top-bar";
import { MobileTabBar } from "@/components/shell/mobile-tab-bar";
import { ShellMain } from "@/components/shell/shell-main";
import type { Stage } from "@/lib/journey";

interface AppShellProps {
  name?: string | null;
  stage: Stage;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  children: React.ReactNode;
}

/** TopBar + Sidebar + content slot (SPEC §7). */
export function AppShell({ name, stage, avatarUrl, isAdmin, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-bg">
      <SidebarNav isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar name={name} stage={stage} avatarUrl={avatarUrl} />
        <ShellMain>{children}</ShellMain>
        <MobileTabBar />
      </div>
    </div>
  );
}
