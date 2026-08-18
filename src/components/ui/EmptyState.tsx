import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 px-6 text-center">
      {icon && <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-white/5 text-muted">{icon}</div>}
      <div>
        <p className="font-display text-sm tracking-tight text-ink">{title}</p>
        {description && <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
