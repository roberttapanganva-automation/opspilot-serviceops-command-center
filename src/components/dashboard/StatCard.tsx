import { Card } from "@/components/ui/Card";
import type { ComponentType } from "react";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{
    "aria-hidden"?: "true";
    className?: string;
    size?: number;
    weight?: "regular" | "duotone";
  }>;
  tone: "primary" | "info" | "success" | "warning";
};

const toneStyles: Record<StatCardProps["tone"], string> = {
  primary:
    "bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)] ring-[var(--ops-primary-glow)]",
  info: "bg-[var(--ops-info-soft)] text-[var(--ops-info)] ring-[var(--ops-info-soft)]",
  success:
    "bg-[var(--ops-success-soft)] text-[var(--ops-success)] ring-[var(--ops-success-soft)]",
  warning:
    "bg-[var(--ops-warning-soft)] text-[var(--ops-warning)] ring-[var(--ops-warning-soft)]",
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--ops-text-soft)]">
            {title}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-[var(--ops-text)]">
            {value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-4 ${toneStyles[tone]}`}
        >
          <Icon aria-hidden="true" size={24} weight="duotone" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--ops-text-muted)]">
        {description}
      </p>
    </Card>
  );
}
