'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, Wifi, CreditCard, Shield,
  Settings, ChevronRight, MessageCircle, X,
} from 'lucide-react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/index';
import { useKnowledgeBaseArticles } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/constants';

const CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started',   icon: BookOpen,    color: 'bg-blue-100 text-blue-600'   },
  { id: 'esim-activation', label: 'eSIM & Activation', icon: Wifi,        color: 'bg-purple-100 text-purple-600' },
  { id: 'billing',         label: 'Billing & Payments', icon: CreditCard,  color: 'bg-green-100 text-green-600'  },
  { id: 'security',        label: 'Account & Security', icon: Shield,      color: 'bg-orange-100 text-orange-600' },
  { id: 'settings',        label: 'Settings',           icon: Settings,    color: 'bg-pink-100 text-pink-600'    },
] as const;

export default function KnowledgeBasePage() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const debounced = useDebounce(search, 200);

  const { data: allArticles = [], isLoading } = useKnowledgeBaseArticles();

  const filtered = useMemo(() => {
    return (allArticles as { id: string; category: string; title: string; excerpt: string; views: number; helpful: number }[])
      .filter((a) => {
        const matchCat    = !category || a.category === category;
        const matchSearch = !debounced ||
          a.title.toLowerCase().includes(debounced.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(debounced.toLowerCase());
        return matchCat && matchSearch;
      })
      .sort((a, b) => b.views - a.views);
  }, [allArticles, debounced, category]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto">
        {/* Hero search */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-6 md:px-8 text-white text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-blue-400" aria-hidden="true" />
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">How can we help?</h1>
          <p className="text-slate-400 text-sm mb-6">Search our knowledge base or browse by category</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="search" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              aria-label="Search knowledge base"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-10 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {/* Categories */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
            role="group" aria-label="Filter by category"
          >
            <button
              onClick={() => setCategory(null)}
              aria-pressed={category === null}
              className={`rounded-xl border p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                !category ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'
              }`}
            >
              <BookOpen className="mx-auto mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs font-medium">All Topics</p>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id === category ? null : cat.id)}
                aria-pressed={category === cat.id}
                className={`rounded-xl border p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  category === cat.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'
                }`}
              >
                <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${cat.color}`}>
                  <cat.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-xs font-medium">{cat.label}</p>
              </button>
            ))}
          </div>

          {/* Results */}
          <p className="text-sm text-muted-foreground mb-4" aria-live="polite">
            {isLoading ? 'Loading…' : `${filtered.length} article${filtered.length !== 1 ? 's' : ''} found`}
          </p>

          <div className="space-y-3 mb-10">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed py-16 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="font-semibold mb-1">No articles found</p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or{' '}
                  <button
                    onClick={() => { setSearch(''); setCategory(null); }}
                    className="text-primary hover:underline"
                  >
                    clear filters
                  </button>
                </p>
              </div>
            ) : (
              filtered.map((article, i) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border bg-card p-5 hover:shadow-sm transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>👍 {article.helpful} found helpful</span>
                        <span>{article.views.toLocaleString()} views</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 group-hover:text-primary transition-colors" aria-hidden="true" />
                  </div>
                </motion.article>
              ))
            )}
          </div>

          {/* Contact CTA */}
          <div className="rounded-xl border bg-muted/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-primary flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-sm">Still need help?</p>
                <p className="text-xs text-muted-foreground">Our support team responds within 24 hours.</p>
              </div>
            </div>
            <Button asChild variant="gradient">
              <Link href={ROUTES.SUPPORT}>Contact Support</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
