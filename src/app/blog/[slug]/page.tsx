/**
 * Blog Post Detail — SERVER COMPONENT + SSG + Article JSON-LD
 * =============================================================
 * generateStaticParams builds all posts at build time (SSG).
 * Article schema for SEO, OG image from dynamic /og route.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { getBlogPostServer, getBlogPostsServer } from '@/lib/server/data';
import { ROUTES } from '@/constants';

export const revalidate = 600;

export async function generateStaticParams() {
  const posts = await getBlogPostsServer();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPostServer(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title:       post.title,
    description: post.excerpt,
    openGraph: {
      title:       post.title,
      description: post.excerpt,
      type:        'article',
      publishedTime: post.publishedAt,
      authors:     [post.author.name],
      images:      [{ url: `/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.tag)}`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostServer(params.slug);
  if (!post) notFound();

  const jsonLd = {
    '@context':       'https://schema.org',
    '@type':          'Article',
    headline:         post.title,
    description:      post.excerpt,
    datePublished:    post.publishedAt,
    dateModified:     post.publishedAt,
    author:           { '@type': 'Person', name: post.author.name },
    publisher:        { '@type': 'Organization', name: 'eSIM Platform', logo: { '@type': 'ImageObject', url: 'https://esimplatform.com/logo.png' } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://esimplatform.com/blog/${post.slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen">
        <div className="bg-muted/50 border-b py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-xs text-muted-foreground">
                <li><Link href="/" className="hover:text-primary">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link href={ROUTES.BLOG} className="hover:text-primary">Blog</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground truncate max-w-xs">{post.title}</li>
              </ol>
            </nav>
            <span className="inline-flex rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 mb-4">
              {post.tag}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-muted-foreground mb-6">{post.excerpt}</p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author.name}</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </time>
              </span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.readTime} min read</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-muted text-8xl py-16 border-b" role="img" aria-label={`Cover image for ${post.title}`}>
          {post.coverImage}
        </div>

        <article className="container mx-auto px-4 md:px-6 py-12 max-w-3xl">
          <p className="text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>

          <div className="mt-12 rounded-xl border bg-card p-6 flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{post.author.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{post.author.bio}</p>
            </div>
          </div>

          <div className="mt-8">
            <Link href={ROUTES.BLOG} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
