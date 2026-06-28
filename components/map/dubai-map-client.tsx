"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// MapLibre touches the DOM, load it client-only.
const DubaiMap = dynamic(
  () => import("@/components/map/dubai-map").then((m) => m.DubaiMap),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);

export function DubaiMapClient({ initialShortlist }: { initialShortlist?: string[] }) {
  return <DubaiMap initialShortlist={initialShortlist} />;
}
