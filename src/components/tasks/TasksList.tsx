import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DateTimeCell, DateTimeHeader } from "@/components/ui/DateTimeCell";
import { TaskActions } from "./TaskActions";
import { TaskPriorityBadge, type TaskPriority } from "./TaskPriorityBadge";
import { TaskStatusBadge, type TaskStatus } from "./TaskStatusBadge";
import { TasksEmptyState } from "./TasksEmptyState";

export type TaskRelatedType = "lead" | "job" | "client" | "general";

export type TaskListItem = {
  completed_at: string | null;
  created_at: string;
  description: string | null;
  due_at: string | null;
  id: string;
  priority: TaskPriority;
  related_id: string | null;
  related_type: TaskRelatedType;
  status: TaskStatus;
  title: string;
};

type TasksListProps = {
  canCreateRecords: boolean;
  canDeleteRecords: boolean;
  tasks: TaskListItem[];
};

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function isTaskOverdue(task: TaskListItem) {
  if (!task.due_at || task.status === "done" || task.status === "cancelled") {
    return false;
  }

  return new Date(task.due_at).getTime() < Date.now();
}

function formatRelatedType(value: TaskRelatedType) {
  if (value === "general") {
    return "General";
  }

  return value[0].toUpperCase() + value.slice(1);
}

export function TasksList({
  canCreateRecords,
  canDeleteRecords,
  tasks,
}: TasksListProps) {
  if (tasks.length === 0) {
    return <TasksEmptyState canCreateRecords={canCreateRecords} />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--ops-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--ops-text)]">
          Task queue
        </h2>
        <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
          Tasks are loaded from the active workspace. Overdue is calculated from
          due date and status.
        </p>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--ops-card-soft)] text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
            <tr>
              <th className="px-5 py-3 sm:px-6" scope="col">
                Task
              </th>
              <th className="px-5 py-3" scope="col">
                Status
              </th>
              <th className="px-5 py-3" scope="col">
                Priority
              </th>
              <th className="px-5 py-3" scope="col">
                <DateTimeHeader label="Due" />
              </th>
              <th className="px-5 py-3" scope="col">
                Related
              </th>
              <th className="px-5 py-3" scope="col">
                Created
              </th>
              <th className="px-5 py-3" scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ops-border)] bg-white">
            {tasks.map((task) => {
              const overdue = isTaskOverdue(task);

              return (
                <tr key={task.id}>
                  <td className="px-5 py-4 sm:px-6">
                    <p className="font-medium text-[var(--ops-text)]">
                      {task.title}
                    </p>
                    {task.description ? (
                      <p className="mt-1 max-w-sm truncate text-xs text-[var(--ops-text-muted)]">
                        {task.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-4">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                    <div className="space-y-1">
                      <DateTimeCell emptyLabel="No due date" value={task.due_at} />
                      {overdue ? <Badge variant="danger">Overdue</Badge> : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                    {formatRelatedType(task.related_type)}
                  </td>
                  <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                    {formatCreatedDate(task.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <TaskActions
                      canDeleteRecords={canDeleteRecords}
                      status={task.status}
                      taskId={task.id}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[var(--ops-border)] xl:hidden">
        {tasks.map((task) => {
          const overdue = isTaskOverdue(task);

          return (
            <article className="p-5" key={task.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--ops-text)]">
                    {task.title}
                  </h2>
                  {task.description ? (
                    <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                      {task.description}
                    </p>
                  ) : null}
                </div>
                <TaskStatusBadge status={task.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                    Priority
                  </p>
                  <div className="mt-1">
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                    Due
                  </p>
                  <div className="mt-1 space-y-1 text-[var(--ops-text-soft)]">
                    <DateTimeCell emptyLabel="No due date" value={task.due_at} />
                    {overdue ? <Badge variant="danger">Overdue</Badge> : null}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                    Related
                  </p>
                  <p className="mt-1 text-[var(--ops-text-soft)]">
                    {formatRelatedType(task.related_type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                    Created
                  </p>
                  <p className="mt-1 text-[var(--ops-text-soft)]">
                    {formatCreatedDate(task.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <TaskActions
                  canDeleteRecords={canDeleteRecords}
                  status={task.status}
                  taskId={task.id}
                />
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
