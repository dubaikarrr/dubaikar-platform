import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/profile";
import { getFeed } from "@/lib/actions/community";
import { CommunityClient } from "@/components/community/community-client";

export const metadata: Metadata = { title: "Community" };

export default async function CommunityPage() {
  const profile = await requireOnboardedProfile();
  const posts = await getFeed();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-text">Community</h1>
        <p className="text-sm text-text-muted">
          Movers helping movers. Ask, share, and learn from others on the same journey.
        </p>
      </div>
      <CommunityClient myId={profile.id} posts={posts} />
    </div>
  );
}
