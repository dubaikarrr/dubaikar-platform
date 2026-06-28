import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingMinutes: number;
}

export interface Post extends PostMeta {
  content: string;
}

function readDir(): string[] {
  try {
    return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

function minutes(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

export function getAllPosts(): PostMeta[] {
  return readDir()
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        date: data.date ?? "",
        category: data.category ?? "Guide",
        readingMinutes: minutes(content),
      } satisfies PostMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Up to `limit` other guides, same-category first. */
export function getRelated(slug: string, limit = 3): PostMeta[] {
  const all = getAllPosts();
  const me = all.find((p) => p.slug === slug);
  if (!me) return all.slice(0, limit);
  const same = all.filter((p) => p.slug !== slug && p.category === me.category);
  const rest = all.filter((p) => p.slug !== slug && p.category !== me.category);
  return [...same, ...rest].slice(0, limit);
}

export function getPost(slug: string): Post | null {
  try {
    const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), "utf8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? "",
      category: data.category ?? "Guide",
      readingMinutes: minutes(content),
      content,
    };
  } catch {
    return null;
  }
}

export function getCategories(): string[] {
  return Array.from(new Set(getAllPosts().map((p) => p.category)));
}
