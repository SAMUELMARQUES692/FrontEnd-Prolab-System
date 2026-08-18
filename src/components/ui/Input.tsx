import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const baseClasses =
  "w-full rounded-md border border-border bg-canvas-2/60 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-2 " +
  "outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20 disabled:opacity-50";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, leftIcon, ...props }, ref) => {
  if (leftIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2">{leftIcon}</span>
        <input ref={ref} className={cn(baseClasses, "pl-9", className)} {...props} />
      </div>
    );
  }
  return <input ref={ref} className={cn(baseClasses, className)} {...props} />;
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(baseClasses, "min-h-[88px] resize-y", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(baseClasses, "appearance-none pr-9", className)}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
));
Select.displayName = "Select";
