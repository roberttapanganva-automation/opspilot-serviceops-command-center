import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PipelineBoard as PipelineBoardData } from "@/types/domain";
import { PipelineColumn } from "./PipelineColumn";

type PipelineBoardProps = {
  board: PipelineBoardData;
  currencyCode: string;
  showOwnerLink: boolean;
};

export function PipelineBoard({
  board,
  currencyCode,
  showOwnerLink,
}: PipelineBoardProps) {
  if (board.groups.length === 0) {
    return (
      <EmptyState
        description="No pipeline groups exist yet. Owners can create lead and job pipelines in Owner Console."
        title="No pipelines configured"
      />
    );
  }

  if (!board.selected_group || board.stages.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          description="This pipeline group has no stages yet. Add stages in Owner Console to start moving cards."
          title="No stages in this pipeline"
        />
        {showOwnerLink ? (
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white px-4 text-sm font-semibold text-[var(--ops-text)] transition hover:bg-[var(--ops-card-soft)]"
            href="/owner/pipeline"
          >
            Open Owner Console Pipeline
          </Link>
        ) : null}
      </div>
    );
  }

  const stageOptions = board.stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--ops-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ops-text-muted)]">
              Active workflow
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--ops-text)]">
              {board.selected_group.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
              {board.selected_group.description?.trim() ||
                "Owner-defined workflow for active workspace records."}
            </p>
          </div>
          <div className="text-sm text-[var(--ops-text-soft)]">
            {board.can_move_cards
              ? "Use the move control on each card to update its stage."
              : "Viewer access is read-only on the pipeline board."}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:overflow-x-auto md:pb-2">
        {board.stages.map((stage) => (
          <PipelineColumn
            canMoveCards={board.can_move_cards}
            currencyCode={currencyCode}
            key={stage.id}
            stage={stage}
            stageOptions={stageOptions}
          />
        ))}
      </div>
    </div>
  );
}
