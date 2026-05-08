import { Card } from "@/components/ui/Card";
import { LeadStatusBadge, type LeadStatus } from "./LeadStatusBadge";
import { LeadPriorityBadge, type LeadPriority } from "./LeadPriorityBadge";
import { LeadsEmptyState } from "./LeadsEmptyState";

export type LeadListItem = {
  client: {
    email: string | null;
    name: string;
  } | null;
  client_id: string | null;
  id: string;
  title: string;
  source: string | null;
  priority: LeadPriority;
  status: LeadStatus;
  estimated_value: number;
  next_follow_up_at: string | null;
  created_at: string;
};

type LeadsListProps = {
  canCreateRecords: boolean;
  leads: LeadListItem[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function LeadsList({ canCreateRecords, leads }: LeadsListProps) {
  if (leads.length === 0) {
    return <LeadsEmptyState canCreateRecords={canCreateRecords} />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--ops-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--ops-text)]">
          Lead queue
        </h2>
        <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
          Leads are loaded from the active workspace.
        </p>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--ops-card-soft)] text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
            <tr>
              <th className="px-5 py-3 sm:px-6" scope="col">
                Lead
              </th>
              <th className="px-5 py-3" scope="col">
                Status
              </th>
              <th className="px-5 py-3" scope="col">
                Priority
              </th>
              <th className="px-5 py-3" scope="col">
                Est. value
              </th>
              <th className="px-5 py-3" scope="col">
                Source
              </th>
              <th className="px-5 py-3" scope="col">
                Next follow-up
              </th>
              <th className="px-5 py-3" scope="col">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ops-border)] bg-white">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-5 py-4 sm:px-6">
                  <p className="font-medium text-[var(--ops-text)]">
                    {lead.title}
                  </p>
                  {lead.client ? (
                    <p className="mt-1 text-xs text-[var(--ops-text-muted)]">
                      {lead.client.name}
                      {lead.client.email ? ` · ${lead.client.email}` : ""}
                    </p>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-5 py-4">
                  <LeadPriorityBadge priority={lead.priority} />
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {formatCurrency(lead.estimated_value)}
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {lead.source ?? "Not set"}
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {formatDate(lead.next_follow_up_at)}
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {formatCreatedDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[var(--ops-border)] lg:hidden">
        {leads.map((lead) => (
          <article className="p-5" key={lead.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold text-[var(--ops-text)]">
                  {lead.title}
                </h2>
                {lead.client ? (
                  <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                    {lead.client.name}
                  </p>
                ) : null}
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Priority
                </p>
                <div className="mt-1">
                  <LeadPriorityBadge priority={lead.priority} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Est. value
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {formatCurrency(lead.estimated_value)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Source
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {lead.source ?? "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Next follow-up
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {formatDate(lead.next_follow_up_at)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
