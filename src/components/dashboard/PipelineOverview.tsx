import { SquaresFourIcon } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { DashboardPipelineStageSummary } from "@/types/domain";

type PipelineOverviewProps = {
  jobStages: DashboardPipelineStageSummary[];
  leadStages: DashboardPipelineStageSummary[];
};

function StageRows({
  stages,
  total,
}: {
  stages: DashboardPipelineStageSummary[];
  total: number;
}) {
  return (
    <div className="space-y-3">
      {stages.map((stage) => {
        const width = total > 0 ? Math.max((stage.count / total) * 100, 6) : 0;

        return (
          <div key={stage.id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-[var(--ops-text)]">
                {stage.name}
              </span>
              <span className="shrink-0 font-semibold text-[var(--ops-text-soft)]">
                {stage.count}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[var(--ops-border)]">
              <div
                className="h-2 rounded-full bg-[var(--ops-primary)]"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PipelineOverview({
  jobStages,
  leadStages,
}: PipelineOverviewProps) {
  const leadTotal = leadStages.reduce((total, stage) => total + stage.count, 0);
  const jobTotal = jobStages.reduce((total, stage) => total + stage.count, 0);
  const hasPipelineData = leadTotal + jobTotal > 0;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          description="Lead and job counts grouped by configured pipeline stage."
          title="Pipeline Overview"
        />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
          <SquaresFourIcon aria-hidden="true" size={24} weight="duotone" />
        </div>
      </div>

      {!hasPipelineData ? (
        <div className="mt-6">
          <EmptyState
            description="No pipeline stages with leads or jobs yet."
            title="Pipeline is empty"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {leadStages.length > 0 ? (
            <div className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ops-text)]">
                  Leads
                </p>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  {leadTotal} total
                </p>
              </div>
              <StageRows stages={leadStages} total={leadTotal} />
            </div>
          ) : null}

          {jobStages.length > 0 ? (
            <div className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ops-text)]">
                  Jobs
                </p>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  {jobTotal} total
                </p>
              </div>
              <StageRows stages={jobStages} total={jobTotal} />
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
