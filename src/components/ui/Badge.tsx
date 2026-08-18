import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/enums";

const TONE_STYLES: Record<Tone, string> = {
  neutral: "bg-white/6 text-muted border-border",
  accent: "bg-accent-soft text-accent border-accent/30",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  info: "bg-info-soft text-info border-info/30",
};

export function Badge({
  tone = "neutral",
  children,
  dot = true,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
        TONE_STYLES[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
