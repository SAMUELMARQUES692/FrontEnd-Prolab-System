import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong shadow-soft",
  secondary: "bg-surface text-ink hover:bg-surface-hover border border-border",
  outline: "bg-transparent text-ink border border-border-strong hover:border-accent/60 hover:text-accent",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-surface",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, iconRight, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-pill font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          icon
        )}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";

export function IconButton({
  className,
  variant = "secondary",
  size = "md",
  "aria-label": ariaLabel,
  children,
  ...props
}: Omit<ButtonProps, "icon" | "iconRight"> & { "aria-label": string }) {
  const sizeMap: Record<Size, string> = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        "disabled:cursor-not-allowed disabled:opacity-50 active:scale-95",
        VARIANTS[variant],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
