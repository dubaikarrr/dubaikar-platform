"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import type { AppNotification } from "@/lib/database.types";
import { listNotifications, markRead, markAllRead } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    const r = await listNotifications();
    setItems(r.items);
    setUnread(r.unread);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function onItemClick(n: AppNotification) {
    setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (!n.read) setUnread((u) => Math.max(0, u - 1));
    startTransition(() => markRead(n.id));
    setOpen(false);
    if (n.href) router.push(n.href);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        className="btn btn-ghost btn-icon btn-sm relative"
        aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) refresh();
        }}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-[var(--radius-card)] border border-border bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <span className="text-sm font-medium text-text">Notifications</span>
            {unread > 0 ? (
              <button
                className="flex items-center gap-1 text-xs text-brand hover:underline"
                onClick={() => {
                  setItems((xs) => xs.map((x) => ({ ...x, read: true })));
                  setUnread(0);
                  startTransition(() => markAllRead());
                }}
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            ) : null}
          </div>
          <div className="app-scroll max-h-96 overflow-auto">
            {items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-text-muted">
                Nothing yet, replies, connection requests and journey nudges land here.
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onItemClick(n)}
                  className={cn(
                    "flex w-full items-start gap-2.5 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-surface-2",
                    !n.read && "bg-brand-soft/40",
                  )}
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-border-strong" : "bg-brand")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text">{n.title}</span>
                    {n.body ? <span className="block truncate text-xs text-text-muted">{n.body}</span> : null}
                  </span>
                  <span className="shrink-0 text-[11px] text-text-subtle">{timeAgo(n.created_at)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
