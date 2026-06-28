"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Centers most screens at a comfortable max width, but lets the resume editor
 * (/app/resume/<id>) use the full screen width.
 */
export function ShellMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullWidth = /^\/app\/resume\/[^/]+/.test(pathname) || pathname === "/app/map";

  return (
    <main
      className={cn(
        "app-scroll flex-1 pb-24 md:pb-6",
        fullWidth ? "px-3 py-4 md:px-5" : "px-4 py-6 md:px-6",
      )}
    >
      <div className={cn("w-full", fullWidth ? "" : "mx-auto max-w-5xl")}>
        {children}
      </div>
    </main>
  );
}
