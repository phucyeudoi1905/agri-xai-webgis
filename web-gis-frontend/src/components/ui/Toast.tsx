import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ToastContext, type ToastApi } from './toastContext';

interface ToastItem {
  id: number;
  title: string;
  detail?: string;
  variant: 'success' | 'error';
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback(
    (variant: ToastItem['variant'], title: string, detail?: string) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, title, detail, variant }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 4800);
    },
    [],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, detail) => push('success', title, detail),
      error: (title, detail) => push('error', title, detail),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.variant === 'error' ? 'error' : ''}`}>
            <div>
              <strong>{t.title}</strong>
              {t.detail && <p>{t.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
