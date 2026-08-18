import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {eyebrow && <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-2">{eyebrow}</p>}
        <h1 className="mt-1.5 font-display text-[26px] tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </motion.div>
  );
}
