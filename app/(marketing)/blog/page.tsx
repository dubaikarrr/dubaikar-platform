import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Guides",
  description: "Practical guides for Indian professionals moving to Dubai, visas, budgets, jobs, and settling in.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-text">Guides</h1>
      <p className="mt-1 text-text-muted">
        Practical, no-fluff advice for your move to Dubai.
      </p>

      {posts.length === 0 ? (
        <EmptyState className="mt-8" title="No guides yet" description="Check back soon." />
      ) : (
        <div className="mt-8 grid gap-4">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`}>
              <Card className="p-5 transition-colors hover:bg-surface-2">
                <Badge tone="brand">{p.category}</Badge>
                <h2 className="mt-2 text-text">{p.title}</h2>
                <p className="mt-1 text-sm text-text-muted">{p.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
