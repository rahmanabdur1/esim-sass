import { useState, useCallback } from 'react';
import type { ToastMessage } from '@/types';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration ?? 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) =>
    addToast({ title, description, type: 'success' }), [addToast]);

  const error = useCallback((title: string, description?: string) =>
    addToast({ title, description, type: 'error' }), [addToast]);

  const warning = useCallback((title: string, description?: string) =>
    addToast({ title, description, type: 'warning' }), [addToast]);

  const info = useCallback((title: string, description?: string) =>
    addToast({ title, description, type: 'info' }), [addToast]);

  return { toasts, addToast, removeToast, success, error, warning, info };
}
