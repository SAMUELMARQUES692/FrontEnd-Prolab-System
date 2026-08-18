import { cn } from "@/lib/cn";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex w-fit gap-1 rounded-pill border border-border bg-canvas-2/60 p-1">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-xs font-medium transition-all",
              active ? "bg-accent text-accent-ink shadow-soft" : "text-muted hover:text-ink"
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-pill px-1.5 py-0.5 text-[10px]",
                  active ? "bg-black/15" : "bg-white/8 text-muted-2"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
