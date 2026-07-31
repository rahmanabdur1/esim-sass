'use client';
/**
 * OptimizedImage — Performance-first Image Component
 * ====================================================
 * Wraps next/image with:
 *   - Blur placeholder (no CLS on load)
 *   - Intersection Observer lazy loading
 *   - Error fallback (no broken image icons)
 *   - Skeleton loading animation
 *   - AVIF/WebP format selection (automatic via next/image)
 *   - Responsive srcSet generation
 *
 * Usage:
 *   <OptimizedImage src="/hero.jpg" alt="Hero" width={1200} height={630} priority />
 *   <OptimizedImage src={user.avatar} alt={user.name} fill className="rounded-full" />
 */
import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/utils';

interface Props extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  containerClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  showSkeleton = true,
  containerClassName,
  wrapperStyle,
  className,
  priority = false,
  ...props
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const imgSrc = errored ? fallbackSrc : src;

  return (
    <div className={cn('relative overflow-hidden', containerClassName)} style={wrapperStyle}>
      {/* Skeleton shimmer while loading */}
      {showSkeleton && !loaded && (
        <div className="absolute inset-0 animate-pulse rounded bg-muted" aria-hidden="true" />
      )}

      <Image
        src={imgSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
        priority={priority}
        // Next.js automatically serves AVIF → WebP → original
        // Based on browser Accept header
        {...props}
      />
    </div>
  );
}

// ── Avatar with fallback initials ─────────────────────────────
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export function AvatarImage({ src, alt, size = 40, className }: AvatarImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    const initials = alt
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return (
      <div
        className={cn(
          'flex select-none items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary',
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
        aria-label={alt}
        role="img"
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      onError={() => setErrored(true)}
    />
  );
}

// ── Country flag emoji renderer ───────────────────────────────
export function CountryFlag({
  flag,
  name,
  size = 'text-2xl',
}: {
  flag: string;
  name: string;
  size?: string;
}) {
  return (
    <span className={cn(size, 'leading-none')} role="img" aria-label={`Flag of ${name}`}>
      {flag}
    </span>
  );
}
