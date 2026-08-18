import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/format";
import { IconButton } from "@/components/ui/Button";
import { IconLogout, IconMenu } from "@/components/icons";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-base/80 px-4 backdrop-blur md:px-8">
      <IconButton aria-label="Abrir menu" variant="ghost" className="md:hidden" onClick={onMenuClick}>
        <IconMenu className="h-5 w-5" />
      </IconButton>

      <div className="hidden md:block" />

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-pill border border-border bg-surface/60 py-1.5 pl-1.5 pr-3.5 text-sm text-ink transition-colors hover:bg-surface-hover"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-accent text-xs font-semibold text-accent-ink">
            {initials(user?.email ?? "?")}
          </span>
          <span className="hidden max-w-[160px] truncate sm:inline">{user?.email}</span>
          {user?.isAdmin && (
            <span className="hidden rounded-pill bg-accent-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent sm:inline">
              Admin
            </span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-surface-2 shadow-lift"
              >
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-xs text-muted">Conectado como</p>
                  <p className="truncate text-sm font-medium text-ink">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-danger transition-colors hover:bg-danger/10"
                >
                  <IconLogout className="h-4 w-4" />
                  Sair
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
