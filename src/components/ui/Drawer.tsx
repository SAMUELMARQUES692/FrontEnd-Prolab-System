import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IconButton } from "./Button";

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-full w-full flex-col border-l border-border bg-base shadow-lift"
            style={{ maxWidth: width }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h2 className="font-display text-lg tracking-tight text-ink">{title}</h2>
                {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
              </div>
              <IconButton aria-label="Fechar" variant="ghost" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </IconButton>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="border-t border-border px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
