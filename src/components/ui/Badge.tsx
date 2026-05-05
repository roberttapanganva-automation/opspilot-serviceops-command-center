import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]",
  success: "bg-[var(--ops-success-soft)] text-[var(--ops-success)]",
  warning: "bg-[var(--ops-warning-soft)] text-[var(--ops-warning)]",
  danger: "bg-[var(--ops-danger-soft)] text-[var(--ops-danger)]",
  info: "bg-[var(--ops-info-soft)] text-[var(--ops-info)]",
};

export function Badge({
  children,
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
