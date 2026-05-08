import { Badge } from "@/components/ui/Badge";

export type PaymentStatus =
  | "unpaid"
  | "partial"
  | "paid"
  | "refunded"
  | "not_applicable";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const statusConfig: Record<
  PaymentStatus,
  {
    label: string;
    variant: "default" | "info" | "success" | "warning" | "danger";
  }
> = {
  not_applicable: {
    label: "Not applicable",
    variant: "default",
  },
  paid: {
    label: "Paid",
    variant: "success",
  },
  partial: {
    label: "Partial",
    variant: "warning",
  },
  refunded: {
    label: "Refunded",
    variant: "danger",
  },
  unpaid: {
    label: "Unpaid",
    variant: "info",
  },
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
