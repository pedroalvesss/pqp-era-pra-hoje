"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  text: string;
  undo?: () => void;
}

type ShowToast = (text: string, undo?: () => void) => void;

const ToastContext = createContext<ShowToast>(() => {});

interface ToastProviderProps {
  children: ReactNode;
  /** No app mobile o toast sobe pra não cobrir a tab bar. */
  raised?: boolean;
}

export function ToastProvider({ children, raised = false }: ToastProviderProps) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback<ShowToast>((text, undo) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), text, undo });
    timer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  function handleClickUndoButton() {
    toast?.undo?.();
    setToast(null);
  }

  return (
    <ToastContext value={show}>
      {children}
      <div
        data-toast
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 z-50 flex justify-center px-3 ${raised ? "bottom-24 md:bottom-6" : "bottom-6"}`}
      >
        {toast && (
          <div
            key={toast.id}
            role="status"
            className="animate-pop-in text-bg pointer-events-auto flex items-center gap-3.5 rounded-xl bg-neutral-100 py-2.5 pr-3 pl-4 text-sm font-medium whitespace-nowrap shadow-md"
          >
            <span>{toast.text}</span>
            {toast.undo && (
              <button
                onClick={handleClickUndoButton}
                className="text-accent-700 border-none bg-transparent p-1 text-[13px]"
              >
                desfazer
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
