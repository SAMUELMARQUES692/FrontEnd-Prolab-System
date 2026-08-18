import { Input } from "./Input";

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      leftIcon={
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      }
    />
  );
}
