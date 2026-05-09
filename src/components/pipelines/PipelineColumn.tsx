import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/formatting/currency";
import type { PipelineBoardStage } from "@/types/domain";
import { PipelineCard } from "./PipelineCard";

type PipelineColumnProps = {
  canMoveCards: boolean;
  currencyCode: string;
  stage: PipelineBoardStage;
  stageOptions: Pick<PipelineBoardStage, "id" | "name">[];
};

export function PipelineColumn({
  canMoveCards,
  currencyCode,
  stage,
  stageOptions,
}: PipelineColumnProps) {
  return (
    <section className="flex h-full min-h-[320px] min-w-[280px] flex-col rounded-xl border border-[var(--ops-border)] bg-[var(--ops-card)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h2 className="truncate text-sm font-semibold text-[var(--ops-text)]">
              {stage.name}
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--ops-text-soft)]">
            {stage.card_count} card{stage.card_count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
            Est. value
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ops-text)]">
            {formatCurrency(stage.total_estimated_value, currencyCode)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {stage.cards.length === 0 ? (
          <EmptyState
            description="No cards in this stage."
            title="Stage is empty"
          />
        ) : (
          stage.cards.map((card) => (
            <PipelineCard
              canMoveCards={canMoveCards}
              card={card}
              currencyCode={currencyCode}
              key={card.id}
              stageOptions={stageOptions}
            />
          ))
        )}
      </div>
    </section>
  );
}
