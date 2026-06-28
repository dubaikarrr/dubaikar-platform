import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, Clock } from "lucide-react";
import { getPost, getRelated, getAllPosts } from "@/lib/content";
import { listBookmarks } from "@/lib/actions/bookmarks";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SaveGuideButton } from "@/components/knowledge/save-guide-button";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? { title: post.title } : {};
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="mt-6 text-text" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="mt-4 text-text" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="leading-7 text-text-muted" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="ml-5 list-disc space-y-1 text-text-muted" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="ml-5 list-decimal space-y-1 text-text-muted" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="font-medium text-brand hover:underline" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-2 border-brand pl-4 italic text-text-muted" {...props} />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto"><table className="w-full border-collapse text-sm [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_th]:border [&_th]:border-border [&_th]:bg-surface-2 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left" {...props} /></div>
  ),
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const [related, saved] = await Promise.all([
    Promise.resolve(getRelated(slug)),
    listBookmarks("guide"),
  ]);
  const isSaved = saved.some((b) => b.ref_key === slug);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/app/knowledge" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" /> Knowledge hub
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone="brand">{post.category}</Badge>
          <h1 className="mt-2 text-2xl font-medium text-text">{post.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-text-subtle">
            <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min read
          </p>
        </div>
        <SaveGuideButton slug={slug} initialSaved={isSaved} />
      </div>

      <div className="space-y-4 text-text">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>

      {related.length ? (
        <div className="border-t border-border pt-5">
          <h2 className="mb-3 text-text">Keep reading</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/app/knowledge/${r.slug}`}>
                <Card className="hovcard h-full p-3">
                  <Badge tone="brand" className="!text-[10px]">{r.category}</Badge>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-text">{r.title}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
