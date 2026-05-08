import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { OwnerAuditLog } from "@/types/domain";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function metadataSummary(metadata: Record<string, unknown> | null) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "No metadata";
  }

  return Object.entries(metadata)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");
}

export function AuditLogsList({ logs }: { logs: OwnerAuditLog[] }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-semibold text-[var(--ops-text)]">Audit Logs</h2>
      <p className="mt-2 text-sm text-[var(--ops-text-soft)]">
        Latest workspace audit events visible to the owner.
      </p>

      {logs.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="Workspace actions will appear here once audit rows exist."
            title="No audit logs yet"
          />
        </div>
      ) : (
        <div className="mt-5 divide-y divide-[var(--ops-border)] overflow-hidden rounded-lg border border-[var(--ops-border)]">
          {logs.map((log) => (
            <article className="bg-white p-4" key={log.id}>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--ops-text)]">
                    {log.action}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                    {log.entity_type} · {log.entity_id ?? "No entity id"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ops-text-muted)]">
                    Actor {log.actor_user_id ?? "system"} · {metadataSummary(log.metadata)}
                  </p>
                </div>
                <p className="text-sm text-[var(--ops-text-muted)]">
                  {formatDate(log.created_at)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
