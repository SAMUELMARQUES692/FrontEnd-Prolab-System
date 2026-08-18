import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/enums";

const TONE_COLOR: Record<Tone, string> = {
  neutral: "var(--color-muted)",
  accent: "var(--color-accent)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
};

export function StatRing({
  percent,
  size = 56,
  stroke = 5,
  tone = "accent",
  className,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = c - (clamped / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("shrink-0 -rotate-90", className)}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={TONE_COLOR[tone]}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

export function StatWidget({
  label,
  value,
  percent,
  tone = "accent",
  icon,
}: {
  label: string;
  value: string;
  percent?: number;
  tone?: Tone;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {percent !== undefined ? (
        <div className="relative flex items-center justify-center">
          <StatRing percent={percent} tone={tone} />
          <span className="absolute font-display text-[11px] text-ink">{Math.round(percent)}%</span>
        </div>
      ) : (
        icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-white/6 text-ink">
            {icon}
          </div>
        )
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="font-display text-lg tracking-tight text-ink">{value}</p>
      </div>
    </div>
  );
}
