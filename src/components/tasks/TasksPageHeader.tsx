import { CheckSquareIcon } from "@phosphor-icons/react/ssr";
import { AddTaskDialog } from "./AddTaskDialog";

type TasksPageHeaderProps = {
  canCreateRecords: boolean;
};

export function TasksPageHeader({ canCreateRecords }: TasksPageHeaderProps) {
  return (
    <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
              <CheckSquareIcon aria-hidden="true" size={24} weight="duotone" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--ops-primary-dark)]">
                Follow-up engine
              </p>
              <h1 className="text-2xl font-semibold tracking-normal text-[var(--ops-text)] sm:text-3xl">
                Tasks
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
            Keep follow-ups, reminders, and operational tasks moving so nothing critical slips through the day.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {canCreateRecords ? <AddTaskDialog /> : null}
        </div>
      </div>
    </section>
  );
}
