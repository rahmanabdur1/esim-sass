'use client';
import React, { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import { ROUTES } from '@/constants';

interface Props {
  children:    ReactNode;
  fallback?:   ReactNode;
  onError?:    (error: Error, info: React.ErrorInfo) => void;
  level?:      'page' | 'section' | 'widget';
}

interface State {
  hasError:    boolean;
  error:       Error | null;
  errorInfo:   React.ErrorInfo | null;
  eventId:     string | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, eventId: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
      tags:  { source: 'error-boundary', level: this.props.level ?? 'page' },
    });
    this.setState({ errorInfo, eventId });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, eventId: null, showDetails: false });
  };

  override render() {
    const { hasError, error, errorInfo, eventId, showDetails } = this.state;
    const { children, fallback, level = 'page' } = this.props;

    if (!hasError) return children;
    if (fallback)  return fallback;

    // Widget-level error — compact inline
    if (level === 'widget') {
      return (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">Something went wrong</p>
            <p className="text-xs text-muted-foreground truncate">{error?.message}</p>
          </div>
          <Button size="sm" variant="outline" onClick={this.handleReset}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Retry
          </Button>
        </div>
      );
    }

    // Section-level error — moderate
    if (level === 'section') {
      return (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center my-4">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-destructive" aria-hidden="true" />
          <h3 className="font-semibold mb-1">This section failed to load</h3>
          <p className="text-sm text-muted-foreground mb-4">{error?.message || 'An unexpected error occurred.'}</p>
          <Button size="sm" variant="outline" onClick={this.handleReset}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
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
        <div className="max-w-md w-full">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
          </div>

          <h1 id="error-title" className="font-display text-2xl font-bold mb-2">
            Something went wrong
          </h1>
          <p id="error-desc" className="text-muted-foreground mb-2">
            An unexpected error occurred. Our team has been notified automatically.
          </p>
          {eventId && (
            <p className="text-xs text-muted-foreground font-mono mb-6">
              Error ID: <span className="select-all">{eventId}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
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
              className="text-xs text-primary hover:underline mb-4"
              onClick={() => Sentry.showReportDialog({ eventId })}
            >
              Report this issue with feedback
            </button>
          )}

          {/* Technical details (dev only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="text-left mt-4">
              <button
                onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                aria-expanded={showDetails}
              >
                {showDetails
                  ? <ChevronUp   className="h-3.5 w-3.5" aria-hidden="true" />
                  : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
                Technical details (dev mode)
              </button>
              {showDetails && (
                <div className="mt-2 rounded-lg bg-muted p-4 text-left overflow-auto max-h-64">
                  <p className="text-xs font-mono text-destructive font-semibold mb-2">
                    {error.name}: {error.message}
                  </p>
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                    {error.stack}
                  </pre>
                  {errorInfo?.componentStack && (
                    <>
                      <p className="text-xs font-mono font-semibold mt-3 mb-1">Component Stack:</p>
                      <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
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
