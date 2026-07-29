import SystemStatusClient from '@/components/systemStatus/SystemStatusClient';

export const revalidate = 300;

export default function Page() {
  return <SystemStatusClient />;
}