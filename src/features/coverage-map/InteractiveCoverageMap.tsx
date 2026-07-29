'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Wifi, Signal, X } from 'lucide-react';
import { cn } from '@/utils';
import Link from 'next/link';
import { ROUTES } from '@/constants';

interface MapRegion {
  id: string;
  name: string;
  flag: string;
  x: number; // percentage position on the simplified map
  y: number;
  networks: { name: string; tech: ('4G' | '5G' | 'LTE')[] }[];
  coverageQuality: 'excellent' | 'good' | 'fair';
}

const REGIONS: MapRegion[] = [
  {
    id: 'us',
    name: 'United States',
    flag: '🇺🇸',
    x: 18,
    y: 38,
    coverageQuality: 'excellent',
    networks: [
      { name: 'T-Mobile', tech: ['4G', '5G'] },
      { name: 'AT&T', tech: ['4G', '5G'] },
    ],
  },
  {
    id: 'gb',
    name: 'United Kingdom',
    flag: '🇬🇧',
    x: 47,
    y: 26,
    coverageQuality: 'excellent',
    networks: [
      { name: 'EE', tech: ['4G', '5G'] },
      { name: 'Vodafone', tech: ['4G', '5G'] },
    ],
  },
  {
    id: 'fr',
    name: 'France',
    flag: '🇫🇷',
    x: 47,
    y: 31,
    coverageQuality: 'excellent',
    networks: [{ name: 'Orange', tech: ['4G', '5G'] }],
  },
  {
    id: 'de',
    name: 'Germany',
    flag: '🇩🇪',
    x: 50,
    y: 27,
    coverageQuality: 'excellent',
    networks: [{ name: 'Deutsche Telekom', tech: ['4G', '5G'] }],
  },
  {
    id: 'jp',
    name: 'Japan',
    flag: '🇯🇵',
    x: 85,
    y: 36,
    coverageQuality: 'excellent',
    networks: [
      { name: 'NTT Docomo', tech: ['4G', '5G'] },
      { name: 'SoftBank', tech: ['4G', '5G'] },
    ],
  },
  {
    id: 'au',
    name: 'Australia',
    flag: '🇦🇺',
    x: 83,
    y: 75,
    coverageQuality: 'good',
    networks: [{ name: 'Telstra', tech: ['4G', '5G'] }],
  },
  {
    id: 'br',
    name: 'Brazil',
    flag: '🇧🇷',
    x: 30,
    y: 65,
    coverageQuality: 'good',
    networks: [{ name: 'Vivo', tech: ['4G'] }],
  },
  {
    id: 'in',
    name: 'India',
    flag: '🇮🇳',
    x: 68,
    y: 45,
    coverageQuality: 'good',
    networks: [
      { name: 'Jio', tech: ['4G', '5G'] },
      { name: 'Airtel', tech: ['4G'] },
    ],
  },
  {
    id: 'za',
    name: 'South Africa',
    flag: '🇿🇦',
    x: 53,
    y: 72,
    coverageQuality: 'fair',
    networks: [{ name: 'Vodacom', tech: ['4G'] }],
  },
  {
    id: 'eg',
    name: 'Egypt',
    flag: '🇪🇬',
    x: 56,
    y: 42,
    coverageQuality: 'fair',
    networks: [{ name: 'Vodafone Egypt', tech: ['4G'] }],
  },
  {
    id: 'th',
    name: 'Thailand',
    flag: '🇹🇭',
    x: 76,
    y: 48,
    coverageQuality: 'good',
    networks: [{ name: 'AIS', tech: ['4G', '5G'] }],
  },
  {
    id: 'mx',
    name: 'Mexico',
    flag: '🇲🇽',
    x: 16,
    y: 47,
    coverageQuality: 'good',
    networks: [{ name: 'Telcel', tech: ['4G'] }],
  },
];

const QUALITY_COLOR: Record<MapRegion['coverageQuality'], string> = {
  excellent: '#10b981',
  good: '#3b82f6',
  fair: '#f59e0b',
};

export function InteractiveCoverageMap() {
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<MapRegion | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.75, z - 0.25));
  const handleReset = () => {
    setZoom(1);
    setSelected(null);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      {/* Toolbar */}
      <div
        className="absolute right-4 top-4 z-10 flex flex-col gap-1.5"
        role="group"
        aria-label="Map controls"
      >
        <button
          onClick={handleZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          onClick={handleReset}
          className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Reset map view"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 z-10 rounded-lg border bg-card/95 p-3 text-xs shadow-sm backdrop-blur"
        aria-label="Coverage quality legend"
      >
        <p className="mb-2 font-semibold">Coverage Quality</p>
        {Object.entries(QUALITY_COLOR).map(([quality, color]) => (
          <div key={quality} className="mb-1 flex items-center gap-2 last:mb-0">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="capitalize text-muted-foreground">{quality}</span>
          </div>
        ))}
      </div>

      {/* Map canvas */}
      <div
        className="relative h-96 overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 md:h-[480px]"
        role="img"
        aria-label="World coverage map. Use Tab to navigate between countries."
      >
        <motion.div
          animate={{ scale: zoom }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="absolute inset-0"
        >
          {/* Simplified world dots background pattern */}
          <svg className="absolute inset-0 h-full w-full opacity-10" aria-hidden="true">
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Country markers */}
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelected(region)}
              onMouseEnter={() => setHovered(region.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(region.id)}
              onBlur={() => setHovered(null)}
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
              className="group absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
              aria-label={`${region.name} — ${region.coverageQuality} coverage. Click for network details.`}
            >
              <motion.span
                animate={{ scale: hovered === region.id ? 1.4 : 1 }}
                className="block h-3 w-3 cursor-pointer rounded-full shadow-md ring-2 ring-white"
                style={{ backgroundColor: QUALITY_COLOR[region.coverageQuality] }}
              />
              <AnimatePresence>
                {hovered === region.id && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-lg"
                  >
                    {region.flag} {region.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Selected country panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t"
            role="region"
            aria-label={`Network details for ${selected.name}`}
          >
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label={selected.name}>
                    {selected.flag}
                  </span>
                  <div>
                    <p className="font-semibold">{selected.name}</p>
                    <p
                      className={cn(
                        'text-xs font-medium capitalize',
                        selected.coverageQuality === 'excellent' && 'text-green-600',
                        selected.coverageQuality === 'good' && 'text-blue-600',
                        selected.coverageQuality === 'fair' && 'text-yellow-600',
                      )}
                    >
                      {selected.coverageQuality} coverage
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close country details"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mb-4 space-y-2">
                {selected.networks.map((net) => (
                  <div
                    key={net.name}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Wifi className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {net.name}
                    </span>
                    <span className="flex gap-1">
                      {net.tech.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          <Signal className="h-3 w-3" aria-hidden="true" /> {t}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href={`${ROUTES.COUNTRIES}/${selected.id}`}
                className="inline-flex items-center gap-1 rounded text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View plans for {selected.name} →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
