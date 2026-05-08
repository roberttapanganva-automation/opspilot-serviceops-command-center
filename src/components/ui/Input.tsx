import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  label: string;
};

export function Input({
  className = "",
  icon,
  id,
  label,
  ...props
}: InputProps) {
  return (
    <div className="relative min-w-0">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-[var(--ops-text-muted)]">
          {icon}
        </span>
      ) : null}
      <input
        className={`h-10 w-full min-w-0 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)] sm:w-64 ${icon ? "pl-9" : ""} ${className}`}
        id={id}
        {...props}
      />
    </div>
  );
}
