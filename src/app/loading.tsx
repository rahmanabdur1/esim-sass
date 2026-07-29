import { Spinner } from '@/components/atoms/index';
import { Globe } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4" aria-label="Loading page">
      <Globe className="h-10 w-10 text-primary animate-pulse" aria-hidden="true" />
      <Spinner size="md" label="Loading page..." />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
