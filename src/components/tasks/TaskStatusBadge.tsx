import { Badge } from "@/components/ui/Badge";

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

type TaskStatusBadgeProps = {
  status: TaskStatus;
};

const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    variant: "default" | "info" | "success" | "danger";
  }
> = {
  cancelled: {
    label: "Cancelled",
    variant: "danger",
  },
  done: {
    label: "Done",
    variant: "success",
  },
  in_progress: {
    label: "In progress",
    variant: "info",
  },
  todo: {
    label: "To do",
    variant: "default",
  },
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
