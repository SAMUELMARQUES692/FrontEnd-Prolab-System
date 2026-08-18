import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";

export function CopyableCode({ value, className }: { value: string | number; className?: string }) {
  const toast = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.info("Copiado", String(value));
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Clique para copiar"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-white/6 px-2 py-1 font-mono text-xs text-ink transition-colors hover:bg-white/12",
        className
      )}
    >
      {value}
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-muted-2">
        <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 15V6a1 1 0 0 1 1-1h9" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </button>
  );
}
