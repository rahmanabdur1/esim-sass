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
  title:       'Blog — eSIM & Travel Connectivity Tips',
  description: 'Guides, tips, and news about eSIM technology and staying connected while travelling.',
};

export default async function BlogPage() {
  const posts = await getBlogPostsServer();

  const tags   = ['All', ...Array.from(new Set(posts.flatMap((p) => p.tags)))];

  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen">
        <div className="bg-muted/50 border-b py-16 text-center">
          <h1 className="font-display text-4xl font-bold mb-3">Blog</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Guides, tips, and news about eSIM technology and global connectivity.
          </p>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
          {/* Tag filters — server rendered, no JS needed for display */}
          <div className="flex flex-wrap gap-2 mb-10" role="list" aria-label="Post categories">
            {tags.map((tag) => (
              <span
                key={tag}
                role="listitem"
                className="rounded-full border px-4 py-1.5 text-sm hover:bg-muted cursor-pointer transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Posts grid — pure server HTML, no client JS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-xl border bg-card hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex items-center justify-center h-40 bg-muted/50 text-6xl" role="img" aria-label={post.title}>
                  {post.coverImage}
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 mb-3">
                    {post.tags?.[0] ?? 'All'}
                  </span>
                  <h2 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {post.author.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime} min read
                    </span>
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
