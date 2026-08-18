import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { LeafLogo } from "@/components/icons";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-base lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)",
          }}
        />
        <p
          aria-hidden
          className="pointer-events-none absolute -left-6 bottom-16 select-none font-serif text-[220px] uppercase leading-none text-white/[0.04]"
        >
          prolab
        </p>

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-accent-soft text-accent">
            <LeafLogo className="h-5 w-5" />
          </span>
          <span className="font-display text-lg tracking-tight text-ink">prolab</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-sm"
        >
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-2">Gestão ambiental</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-ink">
            Controle total das cargas, do agendamento à destinação.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Clientes, caminhões, resíduos e posições de estoque em um só lugar — rastreável do início ao fim.
          </p>
        </motion.div>

        <div className="relative flex gap-8 text-xs text-muted-2">
          <span>Clientes</span>
          <span>Agendamentos</span>
          <span>Resíduos</span>
          <span>Estoque</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-accent-soft text-accent">
              <LeafLogo className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-base tracking-tight text-ink">prolab</span>
          </div>

          <h2 className="font-display text-2xl tracking-tight text-ink">{title}</h2>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
