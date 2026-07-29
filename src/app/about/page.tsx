// SSG — statically generated at build time, no revalidation needed
export const dynamic = 'force-static';

import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { Globe, Users, Zap, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about eSIM Platform and our mission to connect travelers worldwide.',
};

const stats = [
  { value: '190+', label: 'Countries Covered' },
  { value: '2M+',  label: 'Happy Travelers'   },
  { value: '500+', label: 'Network Partners'  },
  { value: '99.9%',label: 'Uptime Guarantee'  },
];

const values = [
  { icon: Globe,  title: 'Global Reach',    description: 'We believe everyone deserves seamless connectivity no matter where they travel.' },
  { icon: Zap,    title: 'Instant Access',  description: 'No waiting, no queues. Our technology activates your eSIM in minutes.'           },
  { icon: Heart,  title: 'Customer First',  description: 'Every decision we make is driven by what\'s best for our travelers.'              },
  { icon: Users,  title: 'Built for All',   description: 'From solo backpackers to enterprise teams — we have a plan for everyone.'        },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 text-white text-center">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <Globe className="mx-auto mb-6 h-14 w-14 text-blue-400" aria-hidden="true" />
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Connecting the World, One eSIM at a Time
            </h1>
            <p className="text-slate-300 text-lg">
              Founded in 2020, eSIM Platform was built by travelers for travelers. We set out to eliminate
              the frustration of international roaming and make global connectivity simple, affordable, and instant.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-background border-b" aria-label="Company statistics">
          <div className="container mx-auto px-4 md:px-6">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-sm text-muted-foreground">{s.label}</dt>
                  <dd className="font-display text-4xl font-bold text-primary mt-1">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-muted/40" aria-labelledby="mission-heading">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
            <h2 id="mission-heading" className="font-display text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We exist to remove every barrier between you and the world. Connectivity should not be a luxury
              or a source of stress when you travel. Our mission is to make staying connected abroad as
              effortless as turning on your phone — because the world is better when people can explore it freely.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-background" aria-labelledby="values-heading">
          <div className="container mx-auto px-4 md:px-6">
            <h2 id="values-heading" className="font-display text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <div key={v.title} className="rounded-xl border bg-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <v.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
