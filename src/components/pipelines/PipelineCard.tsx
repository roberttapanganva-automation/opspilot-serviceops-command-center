import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatting/currency";
import { formatDateTime } from "@/lib/formatting/date";
import type { PipelineBoardCard, PipelineBoardStage } from "@/types/domain";
import { MovePipelineCardControl } from "./MovePipelineCardControl";

type PipelineCardProps = {
  canMoveCards: boolean;
  card: PipelineBoardCard;
  currencyCode: string;
  stageOptions: Pick<PipelineBoardStage, "id" | "name">[];
};

function getStatusBadgeVariant(status: string) {
  if (status === "won" || status === "completed" || status === "paid") {
    return "success" as const;
  }

  if (status === "lost" || status === "cancelled" || status === "refunded") {
    return "danger" as const;
  }

  if (
    status === "scheduled" ||
    status === "in_progress" ||
    status === "partial"
  ) {
    return "info" as const;
  }

  if (status === "urgent") {
    return "warning" as const;
  }

  return "default" as const;
}

function getPriorityLabel(priority: PipelineBoardCard["priority"]) {
  if (!priority) {
    return null;
  }

  return priority.replace("_", " ");
}

export function PipelineCard({
  canMoveCards,
  card,
  currencyCode,
  stageOptions,
}: PipelineCardProps) {
  return (
    <article className="rounded-xl border border-[var(--ops-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--ops-text)]">
            {card.title}
          </p>
          {card.client?.name || card.client?.email ? (
            <p className="mt-1 truncate text-xs text-[var(--ops-text-soft)]">
              {card.client?.name ?? card.client?.email}
              {card.client?.name && card.client?.email
                ? ` - ${card.client?.email}`
                : null}
            </p>
          ) : null}
        </div>
        <Badge variant={getStatusBadgeVariant(card.status)}>
          {card.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {typeof card.estimated_value === "number" ? (
          <Badge variant="default">
            {formatCurrency(card.estimated_value, currencyCode)}
          </Badge>
        ) : null}
        {card.priority ? (
          <Badge variant={card.priority === "urgent" ? "warning" : "info"}>
            {getPriorityLabel(card.priority)}
          </Badge>
        ) : null}
        {card.payment_status ? (
          <Badge variant={getStatusBadgeVariant(card.payment_status)}>
            {card.payment_status.replace("_", " ")}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 text-xs leading-5 text-[var(--ops-text-soft)]">
        {card.entity_type === "lead" ? (
          <>
            {card.next_follow_up_at ? (
              <p>
                <span className="font-semibold text-[var(--ops-text-muted)]">
                  Next follow-up:
                </span>{" "}
                {formatDateTime(card.next_follow_up_at)}
              </p>
            ) : null}
          </>
        ) : (
          <>
            {card.service_type ? (
              <p>
                <span className="font-semibold text-[var(--ops-text-muted)]">
                  Service:
                </span>{" "}
                {card.service_type}
              </p>
            ) : null}
            {card.scheduled_start ? (
              <p>
                <span className="font-semibold text-[var(--ops-text-muted)]">
                  Scheduled:
                </span>{" "}
                {formatDateTime(card.scheduled_start)}
              </p>
            ) : null}
          </>
        )}
        {card.location ? (
          <p>
            <span className="font-semibold text-[var(--ops-text-muted)]">
              Location:
            </span>{" "}
            {card.location}
          </p>
        ) : null}
        {!card.location && !card.scheduled_start && !card.next_follow_up_at ? (
          <p className="text-[var(--ops-text-muted)]">No schedule details yet.</p>
        ) : null}
      </div>

      <div className="mt-4 border-t border-[var(--ops-border)] pt-3">
        <MovePipelineCardControl
          canMoveCards={canMoveCards}
          currentStageId={card.stage_id}
          entityType={card.entity_type}
          recordId={card.id}
          stageOptions={stageOptions}
        />
      </div>
    </article>
  );
}
