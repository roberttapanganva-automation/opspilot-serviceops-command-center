import { ArrowRightIcon, BriefcaseIcon } from "@phosphor-icons/react/ssr";
import { AddJobDialog } from "./AddJobDialog";

type JobsPageHeaderProps = {
  canCreateRecords: boolean;
};

export function JobsPageHeader({ canCreateRecords }: JobsPageHeaderProps) {
  return (
    <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
              <BriefcaseIcon aria-hidden="true" size={24} weight="duotone" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--ops-primary-dark)]">
                Service delivery
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-[var(--ops-text)] sm:text-3xl">
                Jobs
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
            Track scheduled work, service status, and estimated revenue.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] px-3 py-2 text-sm text-[var(--ops-text-soft)]">
            <span>Manual job entry is available now</span>
            <ArrowRightIcon aria-hidden="true" size={18} weight="regular" />
          </div>
          {canCreateRecords ? <AddJobDialog /> : null}
        </div>
      </div>
    </section>
  );
}
