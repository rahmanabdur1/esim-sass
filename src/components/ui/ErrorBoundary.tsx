'use client';
import React, { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import { ROUTES } from '@/constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  level?: 'page' | 'section' | 'widget';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
      tags: { source: 'error-boundary', level: this.props.level ?? 'page' },
    });
    this.setState({ errorInfo, eventId });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
    });
  };

  override render() {
    const { hasError, error, errorInfo, eventId, showDetails } = this.state;
    const { children, fallback, level = 'page' } = this.props;

    if (!hasError) return children;
    if (fallback) return fallback;

    // Widget-level error — compact inline
    if (level === 'widget') {
      return (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-destructive">Something went wrong</p>
            <p className="truncate text-xs text-muted-foreground">{error?.message}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleReset}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Retry
          </Button>
        </div>
      );
    }

    // Section-level error — moderate
    if (level === 'section') {
      return (
        <div className="my-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-destructive" aria-hidden="true" />
          <h3 className="mb-1 font-semibold">This section failed to load</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleReset}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Try Again
          </Button>
        </div>
      );
    }

    // Page-level error — full screen
    return (
      <div
        role="alert"
        aria-labelledby="error-title"
        aria-describedby="error-desc"
        className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center"
      >
        <div className="w-full max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
          </div>

          <h1 id="error-title" className="mb-2 font-display text-2xl font-bold">
            Something went wrong
          </h1>
          <p id="error-desc" className="mb-2 text-muted-foreground">
            An unexpected error occurred. Our team has been notified automatically.
          </p>
          {eventId && (
            <p className="mb-6 font-mono text-xs text-muted-foreground">
              Error ID: <span className="select-all">{eventId}</span>
            </p>
          )}

          <div className="mb-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="gradient"
              onClick={this.handleReset}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
            <Button variant="outline" asChild leftIcon={<Home className="h-4 w-4" />}>
              <Link href={ROUTES.HOME}>Go Home</Link>
            </Button>
          </div>

          {/* Report feedback */}
          {eventId && (
            <button
              className="mb-4 text-xs text-primary hover:underline"
              onClick={() => Sentry.showReportDialog({ eventId })}
            >
              Report this issue with feedback
            </button>
          )}

          {/* Technical details (dev only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-4 text-left">
              <button
                onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                className="flex w-full items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={showDetails}
              >
                {showDetails ? (
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Technical details (dev mode)
              </button>
              {showDetails && (
                <div className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted p-4 text-left">
                  <p className="mb-2 font-mono text-xs font-semibold text-destructive">
                    {error.name}: {error.message}
                  </p>
                  <pre className="whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
                    {error.stack}
                  </pre>
                  {errorInfo?.componentStack && (
                    <>
                      <p className="mb-1 mt-3 font-mono text-xs font-semibold">Component Stack:</p>
                      <pre className="whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
                        {errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

// Convenience wrappers
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary level="page">{children}</ErrorBoundary>;
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary level="section">{children}</ErrorBoundary>;
}

export function WidgetErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary level="widget">{children}</ErrorBoundary>;
}
