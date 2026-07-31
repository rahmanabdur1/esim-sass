import { Spinner } from '@/components/atoms/index';
import { Globe } from 'lucide-react';

export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background"
      aria-label="Loading page"
    >
      <Globe className="h-10 w-10 animate-pulse text-primary" aria-hidden="true" />
      <Spinner size="md" label="Loading page..." />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
