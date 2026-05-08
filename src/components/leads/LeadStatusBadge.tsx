import { Badge } from "@/components/ui/Badge";

export type LeadStatus = "open" | "won" | "lost";

type LeadStatusBadgeProps = {
  status: LeadStatus;
};

const statusConfig: Record<
  LeadStatus,
  {
    label: string;
    variant: "default" | "success" | "danger";
  }
> = {
  open: {
    label: "Open",
    variant: "default",
  },
  won: {
    label: "Won",
    variant: "success",
  },
  lost: {
    label: "Lost",
    variant: "danger",
  },
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
