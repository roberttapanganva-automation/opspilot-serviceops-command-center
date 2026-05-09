import Link from "next/link";
import { CrownIcon, RowsIcon } from "@phosphor-icons/react/ssr";
import { PipelineGroupSelect } from "@/components/pipelines/PipelineGroupSelect";
import type { PipelineGroup } from "@/types/domain";

type PipelinePageHeaderProps = {
  groups: PipelineGroup[];
  selectedGroupId: string | null;
  showOwnerLink: boolean;
};

export function PipelinePageHeader({
  groups,
  selectedGroupId,
  showOwnerLink,
}: PipelinePageHeaderProps) {
  return (
    <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
            <RowsIcon aria-hidden="true" size={24} weight="duotone" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--ops-text)] sm:text-3xl">
              Pipelines
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
              Move leads and jobs through owner-defined workflows.
            </p>
            <p className="mt-2 text-sm text-[var(--ops-text-muted)]">
              Owners customize pipeline groups and stages in Owner Console. This
              board shows live workspace records only.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <PipelineGroupSelect
            groups={groups}
            selectedGroupId={selectedGroupId}
          />
          {showOwnerLink ? (
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ops-border)] bg-white px-4 text-sm font-semibold text-[var(--ops-text)] transition hover:bg-[var(--ops-card-soft)]"
              href="/owner/pipeline"
            >
              <CrownIcon aria-hidden="true" size={18} weight="duotone" />
              Owner Console Pipeline
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
