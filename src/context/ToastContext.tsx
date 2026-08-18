import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-success/40 bg-success-soft text-ink",
  error: "border-danger/40 bg-danger-soft text-ink",
  info: "border-info/40 bg-info-soft text-ink",
};

const VARIANT_DOT: Record<ToastVariant, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-info",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value: ToastContextValue = {
    push,
    success: (title, description) => push({ title, description, variant: "success" }),
    error: (title, description) => push({ title, description, variant: "error" }),
    info: (title, description) => push({ title, description, variant: "info" }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-soft backdrop-blur",
                VARIANT_STYLES[t.variant]
              )}
            >
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", VARIANT_DOT[t.variant])} />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs leading-snug text-muted">{t.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
