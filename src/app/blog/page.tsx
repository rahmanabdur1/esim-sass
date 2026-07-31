/**
 * Blog Listing — SERVER COMPONENT + ISR
 * =======================================
 * Posts fetched server-side, cached 10 minutes.
 * Zero JS for the listing — pure server HTML.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { getBlogPostsServer } from '@/lib/server/data';
import { Clock, User } from 'lucide-react';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Blog — eSIM & Travel Connectivity Tips',
  description:
    'Guides, tips, and news about eSIM technology and staying connected while travelling.',
};

export default async function BlogPage() {
  const posts = await getBlogPostsServer();

  const tags = ['All', ...Array.from(new Set(posts.flatMap((p) => p.tags)))];

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-16">
        <div className="border-b bg-muted/50 py-16 text-center">
          <h1 className="mb-3 font-display text-4xl font-bold">Blog</h1>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Guides, tips, and news about eSIM technology and global connectivity.
          </p>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
          {/* Tag filters — server rendered, no JS needed for display */}
          <div className="mb-10 flex flex-wrap gap-2" role="list" aria-label="Post categories">
            {tags.map((tag) => (
              <span
                key={tag}
                role="listitem"
                className="cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Posts grid — pure server HTML, no client JS */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-40 items-center justify-center bg-muted/50 text-6xl"
                  role="img"
                  aria-label={post.title}
                >
                  {post.coverImage}
                </div>
                <div className="p-6">
                  <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {post.tags?.[0] ?? 'All'}
                  </span>
                  <h2 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {post.author.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime} min read
                    </span>
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
