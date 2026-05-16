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

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2">
        {board.stages.map((stage) => (
          <PipelineColumn
            canMoveCards={board.can_move_cards}
            currencyCode={currencyCode}
            key={stage.id}
            stage={stage}
          />
        ))}
      </div>
    </div>
  )
}
