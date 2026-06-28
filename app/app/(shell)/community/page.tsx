import type { Metadata } from "next";
import { requireOnboardedProfile } from "@/lib/profile";
import { getFeed } from "@/lib/actions/community";
import { listMembers, listRequests } from "@/lib/actions/connections";
import { CommunityClient } from "@/components/community/community-client";

export const metadata: Metadata = { title: "Community" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { tab } = await searchParams;
  const [posts, members, requests] = await Promise.all([
    getFeed(),
    listMembers(),
    listRequests(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-text">Community</h1>
        <p className="text-sm text-text-muted">
          Movers helping movers, ask, share, and connect with people on the same journey.
        </p>
      </div>
      <CommunityClient
        myId={profile.id}
        myMoveDate={profile.target_move_date}
        myIndustry={profile.industry}
        posts={posts}
        members={members}
        requests={requests}
        initialTab={tab}
      />
    </div>
  );
}
