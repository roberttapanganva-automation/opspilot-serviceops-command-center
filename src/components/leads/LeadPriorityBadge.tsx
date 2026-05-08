import { Badge } from "@/components/ui/Badge";

export type LeadPriority = "low" | "normal" | "high" | "urgent";

type LeadPriorityBadgeProps = {
  priority: LeadPriority;
};

const priorityConfig: Record<
  LeadPriority,
  {
    label: string;
    variant: "default" | "info" | "warning" | "danger";
  }
> = {
  high: {
    label: "High",
    variant: "warning",
  },
  low: {
    label: "Low",
    variant: "info",
  },
  normal: {
    label: "Normal",
    variant: "default",
  },
  urgent: {
    label: "Urgent",
    variant: "danger",
  },
};

export function LeadPriorityBadge({ priority }: LeadPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
