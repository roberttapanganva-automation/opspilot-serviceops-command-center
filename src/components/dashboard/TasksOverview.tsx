import { CheckSquareIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDateTime } from "@/lib/formatting/date";
import type { DashboardTaskSummary } from "@/types/domain";

type TasksOverviewProps = {
  summary: DashboardTaskSummary;
};

export function TasksOverview({ summary }: TasksOverviewProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          description="Follow-ups, reminders, and operations tasks."
          title="Tasks Overview"
        />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ops-success-soft)] text-[var(--ops-success)]">
          <CheckSquareIcon aria-hidden="true" size={24} weight="duotone" />
        </div>
      </div>

      {summary.totalTasks === 0 ? (
        <div className="mt-6">
          <EmptyState
            description="No tasks yet. Create tasks to track follow-ups and operations."
            title="No tasks yet"
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[var(--ops-card-soft)] p-3">
              <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                Total
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--ops-text)]">
                {summary.totalTasks}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--ops-card-soft)] p-3">
              <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                Overdue
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--ops-danger)]">
                {summary.overdueTasks}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--ops-card-soft)] p-3">
              <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                Pending
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--ops-text)]">
                {summary.pendingTasks}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--ops-card-soft)] p-3">
              <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                Completed
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--ops-success)]">
                {summary.completedTasks}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {summary.recentTasks.map((task) => (
              <div
                className="rounded-lg border border-[var(--ops-border)] bg-white p-3"
                key={task.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-[var(--ops-text)]">
                    {task.title}
                  </p>
                  <Badge
                    variant={
                      task.status === "done"
                        ? "success"
                        : task.status === "cancelled"
                          ? "danger"
                          : "default"
                    }
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-[var(--ops-text-muted)]">
                  {task.due_at ? formatDateTime(task.due_at) : "No due date"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
