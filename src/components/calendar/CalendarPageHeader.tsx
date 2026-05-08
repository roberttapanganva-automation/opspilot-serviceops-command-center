import { CalendarBlankIcon, ClockIcon } from "@phosphor-icons/react/ssr";
import { AddAppointmentDialog } from "./AddAppointmentDialog";

type CalendarPageHeaderProps = {
  canCreateRecords: boolean;
};

export function CalendarPageHeader({
  canCreateRecords,
}: CalendarPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
          <CalendarBlankIcon aria-hidden="true" size={26} weight="duotone" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--ops-text)]">
              Calendar
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ops-card-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ops-text-soft)]">
              <ClockIcon aria-hidden="true" size={14} weight="regular" />
              Workspace schedule
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ops-text-soft)]">
            Track appointments, scheduled work, and service commitments.
          </p>
        </div>
      </div>

      {canCreateRecords ? (
        <AddAppointmentDialog className="w-full sm:w-auto" />
      ) : null}
    </div>
  );
}
