import type { Metadata } from "next";
import { getAllPosts, getCategories } from "@/lib/content";
import { listBookmarks } from "@/lib/actions/bookmarks";
import { KnowledgeList } from "@/components/knowledge/knowledge-list";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Knowledge" };

export default async function KnowledgePage() {
  const posts = getAllPosts();
  const categories = getCategories();
  const saved = await listBookmarks("guide");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-text">Knowledge hub</h1>
        <p className="text-sm text-text-muted">
          Guides for every stage of your move, search, read, and save for later.
        </p>
      </div>
      {posts.length > 0 ? (
        <KnowledgeList posts={posts} categories={categories} savedSlugs={saved.map((b) => b.ref_key)} />
      ) : (
        <EmptyState title="No guides yet" description="Check back soon." />
      )}
    </div>
  );
}
