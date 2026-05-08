import { Badge } from "@/components/ui/Badge";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

const statusMap: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  cancelled: {
    label: "Cancelled",
    variant: "danger",
  },
  completed: {
    label: "Completed",
    variant: "success",
  },
  confirmed: {
    label: "Confirmed",
    variant: "info",
  },
  no_show: {
    label: "No show",
    variant: "warning",
  },
  pending: {
    label: "Pending",
    variant: "default",
  },
};

export function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  const config = statusMap[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
