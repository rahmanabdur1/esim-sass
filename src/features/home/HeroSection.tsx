'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, ArrowRight, Shield, Zap, Headphones } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/index';
import Link from 'next/link';
import { ROUTES } from '@/constants';

const stats = [
  { value: '190+', label: 'Countries' },
  { value: '500+', label: 'Networks' },
  { value: '2M+',  label: 'Happy Users' },
  { value: '24/7', label: 'Support' },
];

const trustBadges = [
  { icon: Zap,         label: 'Instant Activation' },
  { icon: Shield,      label: 'Secure & Reliable'  },
  { icon: Headphones,  label: '24/7 Support'        },
];

export function HeroSection() {
  const [search, setSearch] = useState('');

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-20 md:pt-32 md:pb-28"
      aria-labelledby="hero-heading"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span>Global eSIM Coverage in 190+ Countries</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Stay Connected{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Anywhere
            </span>{' '}
            in the World
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 text-lg text-slate-400 md:text-xl max-w-2xl mx-auto"
          >
            Get instant eSIM for your travels. No physical SIM card needed — activate in minutes
            and enjoy reliable data in over 190 countries.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mb-8 max-w-xl"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search destinations (e.g., Japan, Europe...)"
                  aria-label="Search destinations"
                  leftIcon={<Search className="h-4 w-4" />}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-blue-400"
                />
              </div>
              <Button size="lg" variant="gradient" className="h-12 px-6 flex-shrink-0">
                <Link href={`${ROUTES.PLANS}${search ? `?search=${encodeURIComponent(search)}` : ''}`} className="flex items-center gap-2">
                  Search <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          >
            <Button size="xl" variant="gradient" asChild>
              <Link href={ROUTES.PLANS}>Browse All Plans</Link>
            </Button>
            <Button size="xl" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href={ROUTES.ABOUT}>How It Works</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            aria-label="Platform statistics"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-white font-display">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6"
            aria-label="Trust indicators"
          >
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm text-slate-400">
                <badge.icon className="h-4 w-4 text-blue-400" aria-hidden="true" />
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
