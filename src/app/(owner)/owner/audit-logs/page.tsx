import { AuditLogsList } from "@/components/owner/audit/AuditLogsList";
import { getWorkspaceAuditLogs } from "@/lib/owner/queries";

export default async function OwnerAuditLogsPage() {
  const logs = await getWorkspaceAuditLogs();

  if (!logs) {
    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-[var(--ops-text)]">
          Audit Logs
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
          Owner visibility into real workspace audit events.
        </p>
      </section>
      <AuditLogsList logs={logs} />
    </div>
  );
}
