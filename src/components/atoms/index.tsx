'use client';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils';

// ==================== INPUT ====================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </span>
          )}
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-muted-foreground">{hint}</p>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==================== BADGE ====================
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-700',
        warning: 'border-transparent bg-yellow-100 text-yellow-700',
        info: 'border-transparent bg-blue-100 text-blue-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// ==================== AVATAR ====================
interface AvatarProps {
  src?: string;
  alt: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = { xs: 'h-6 w-6 text-xs', sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' };

function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const initials = name ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div className={cn('relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground', avatarSizes[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span aria-label={alt}>{initials}</span>
      )}
    </div>
  );
}

// ==================== SPINNER ====================
interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string; label?: string; }
const spinnerSizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

function Spinner({ size = 'md', className, label = 'Loading...' }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className={cn('animate-spin rounded-full border-2 border-current border-t-transparent text-primary', spinnerSizes[size], className)}>
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ==================== SKELETON ====================
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted shimmer', className)} {...props} />;
}

// ==================== PROGRESS ====================
interface ProgressProps { value: number; max?: number; className?: string; color?: string; showLabel?: boolean; }

function Progress({ value, max = 100, className, color, showLabel = false }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const getColor = () => {
    if (color) return color;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-primary';
  };
  return (
    <div className="w-full">
      <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className={cn('h-full transition-all duration-500 ease-in-out rounded-full', getColor())} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <p className="mt-1 text-xs text-muted-foreground text-right">{Math.round(percentage)}%</p>}
    </div>
  );
}

export { Input, Badge, badgeVariants, Avatar, Spinner, Skeleton, Progress };
