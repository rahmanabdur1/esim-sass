/**
 * useNetworkStatus
 * =================
 * Detects network speed and connectivity.
 * OfflineBanner is in a separate .tsx file.
 */
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink: number | null;
  rtt: number | null;
  saveData: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    effectiveType: 'unknown',
    downlink: null,
    rtt: null,
    saveData: false,
  }));

  useEffect(() => {
    const connection = (
      navigator as unknown as {
        connection?: {
          effectiveType: string;
          downlink: number;
          rtt: number;
          saveData: boolean;
          addEventListener: (type: string, cb: () => void) => void;
          removeEventListener: (type: string, cb: () => void) => void;
        };
      }
    ).connection;

    const update = () => {
      const effectiveType = (connection?.effectiveType ??
        'unknown') as NetworkStatus['effectiveType'];
      setStatus({
        isOnline: navigator.onLine,
        isSlowConnection: ['slow-2g', '2g'].includes(effectiveType) || (connection?.rtt ?? 0) > 500,
        effectiveType,
        downlink: connection?.downlink ?? null,
        rtt: connection?.rtt ?? null,
        saveData: connection?.saveData ?? false,
      });
    };

    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    connection?.addEventListener('change', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      connection?.removeEventListener('change', update);
    };
  }, []);

  return status;
}
