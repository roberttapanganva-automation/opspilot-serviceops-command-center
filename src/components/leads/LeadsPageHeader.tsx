import { ArrowRightIcon, UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { AddLeadDialog } from "./AddLeadDialog";

type LeadsPageHeaderProps = {
  canCreateRecords: boolean;
};

export function LeadsPageHeader({ canCreateRecords }: LeadsPageHeaderProps) {
  return (
    <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
              <UsersThreeIcon aria-hidden="true" size={24} weight="duotone" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--ops-primary-dark)]">
                Lead intake
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-[var(--ops-text)] sm:text-3xl">
                Leads
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
            Capture, qualify, and follow up with new business opportunities.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] px-3 py-2 text-sm text-[var(--ops-text-soft)]">
            <span>Manual entry is available now</span>
            <ArrowRightIcon aria-hidden="true" size={18} weight="regular" />
          </div>
          {canCreateRecords ? <AddLeadDialog /> : null}
        </div>
      </div>
    </section>
  );
}
