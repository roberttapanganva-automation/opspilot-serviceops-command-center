import { Badge } from "@/components/ui/Badge";

export type JobStatus =
  | "draft"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

type JobStatusBadgeProps = {
  status: JobStatus;
};

const statusConfig: Record<
  JobStatus,
  {
    label: string;
    variant: "default" | "info" | "success" | "warning" | "danger";
  }
> = {
  cancelled: {
    label: "Cancelled",
    variant: "danger",
  },
  completed: {
    label: "Completed",
    variant: "success",
  },
  draft: {
    label: "Draft",
    variant: "default",
  },
  in_progress: {
    label: "In progress",
    variant: "warning",
  },
  scheduled: {
    label: "Scheduled",
    variant: "info",
  },
};

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
