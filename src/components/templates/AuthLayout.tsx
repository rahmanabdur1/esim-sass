import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { ROUTES } from '@/constants';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12 text-white"
        aria-hidden="true"
      >
        <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 font-display font-bold text-xl">
          <Globe className="h-7 w-7 text-blue-400" />
          eSIM Platform
        </Link>
        <div>
          <blockquote className="text-2xl font-display font-semibold leading-snug mb-4">
            "Stay connected wherever your journey takes you — instantly."
          </blockquote>
          <p className="text-slate-400 text-sm">
            Trusted by 2 million+ travelers in 190+ countries.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-slate-400">
          {[['190+','Countries'],['2M+','Travelers'],['99.9%','Uptime']].map(([v,l]) => (
            <div key={l}>
              <p className="text-white font-bold text-xl">{v}</p>
              <p>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 lg:bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 font-display font-bold text-xl text-white">
              <Globe className="h-6 w-6 text-blue-400" />
              eSIM Platform
            </Link>
          </div>
          <div className="mb-6 lg:block hidden">
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
