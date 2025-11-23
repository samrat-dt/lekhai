import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

let toastIdCounter = 0;

const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener(toasts));
}

export function useToast() {
  const [, setToasts] = useState<Toast[]>([]);

  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
      const id = String(++toastIdCounter);
      const newToast: Toast = { id, title, description, variant };

      toasts = [...toasts, newToast];
      notifyListeners();

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        notifyListeners();
      }, 5000);
    },
    []
  );

  return { toast };
}
