import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/profile";
import { listBookmarks } from "@/lib/actions/bookmarks";
import { DubaiMapClient } from "@/components/map/dubai-map-client";

export const metadata: Metadata = { title: "Explore Dubai" };

export default async function MapPage() {
  await requireOnboardedProfile();
  const bookmarks = await listBookmarks("area");
  return (
    <div className="flex h-[calc(100dvh-220px)] min-h-[420px] flex-col gap-3 md:h-[calc(100vh-104px)]">
      <div>
        <h1 className="text-text">Explore Dubai</h1>
        <p className="hidden text-sm text-text-muted sm:block">
          Where Indians live, rent bands, metro reach, and Indian groceries, temples &amp; CBSE/ICSE schools.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <DubaiMapClient initialShortlist={bookmarks.map((b) => b.ref_key)} />
      </div>
    </div>
  );
}
