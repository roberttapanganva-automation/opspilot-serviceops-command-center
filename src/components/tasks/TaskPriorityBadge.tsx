import { Badge } from "@/components/ui/Badge";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

type TaskPriorityBadgeProps = {
  priority: TaskPriority;
};

const priorityConfig: Record<
  TaskPriority,
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

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
