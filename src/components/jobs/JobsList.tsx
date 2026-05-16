import { Card } from "@/components/ui/Card";
import { DateTimeCell, DateTimeHeader } from "@/components/ui/DateTimeCell";
import { DeleteRecordButton } from "@/components/records/DeleteRecordButton";
import { EditJobDialog } from "./EditJobDialog";
import { JobStatusBadge, type JobStatus } from "./JobStatusBadge";
import { JobsEmptyState } from "./JobsEmptyState";
import {
  PaymentStatusBadge,
  type PaymentStatus,
} from "./PaymentStatusBadge";

export type JobListItem = {
  client: {
    email: string | null;
    name: string;
  } | null;
  client_id: string | null;
  created_at: string;
  estimated_value: number;
  id: string;
  location: string | null;
  payment_status: PaymentStatus;
  scheduled_end: string | null;
  scheduled_start: string | null;
  service_type: string | null;
  status: JobStatus;
  title: string;
};

type JobsListProps = {
  canCreateRecords: boolean;
  canDeleteRecords: boolean;
  jobs: JobListItem[];
};

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

export function JobsList({
  canCreateRecords,
  canDeleteRecords,
  jobs,
}: JobsListProps) {
  if (jobs.length === 0) {
    return <JobsEmptyState canCreateRecords={canCreateRecords} />;
  }
  const showActions = canCreateRecords || canDeleteRecords;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--ops-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--ops-text)]">
          Job queue
        </h2>
        <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
          Review upcoming service work, delivery status, and billing progress without leaving the queue.
        </p>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--ops-card-soft)] text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
            <tr>
              <th className="px-5 py-3 sm:px-6" scope="col">
                Job
              </th>
              <th className="px-5 py-3" scope="col">
                Status
              </th>
              <th className="px-5 py-3" scope="col">
                <DateTimeHeader label="Schedule" />
              </th>
              <th className="px-5 py-3" scope="col">
                Location
              </th>
              <th className="px-5 py-3" scope="col">
                Est. value
              </th>
              <th className="px-5 py-3" scope="col">
                Payment
              </th>
              <th className="px-5 py-3" scope="col">
                Created
              </th>
              {showActions ? (
                <th className="px-5 py-3 text-right" scope="col">
                  Action
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ops-border)] bg-white">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-5 py-4 sm:px-6">
                  <p className="font-medium text-[var(--ops-text)]">
                    {job.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ops-text-muted)]">
                    {job.service_type ?? "Service type not set"}
                    {job.client ? ` · ${job.client.name}` : ""}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <JobStatusBadge status={job.status} />
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  <DateTimeCell value={job.scheduled_start} />
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {job.location ?? "Not set"}
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {formatCurrency(job.estimated_value)}
                </td>
                <td className="px-5 py-4">
                  <PaymentStatusBadge status={job.payment_status} />
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {formatCreatedDate(job.created_at)}
                </td>
                {showActions ? (
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {canCreateRecords ? <EditJobDialog job={job} /> : null}
                      {canDeleteRecords ? (
                        <DeleteRecordButton
                          endpoint={`/api/jobs/${job.id}`}
                          label={`Delete job ${job.title}`}
                        />
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[var(--ops-border)] xl:hidden">
        {jobs.map((job) => (
          <article className="p-5" key={job.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold text-[var(--ops-text)]">
                  {job.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                  {job.service_type ?? "Service type not set"}
                </p>
              </div>
              <JobStatusBadge status={job.status} />
            </div>
            {showActions ? (
              <div className="mt-4 flex justify-end gap-2">
                {canCreateRecords ? <EditJobDialog job={job} /> : null}
                {canDeleteRecords ? (
                  <DeleteRecordButton
                    endpoint={`/api/jobs/${job.id}`}
                    label={`Delete job ${job.title}`}
                  />
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Schedule
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  <DateTimeCell value={job.scheduled_start} />
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Est. value
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {formatCurrency(job.estimated_value)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Payment
                </p>
                <div className="mt-1">
                  <PaymentStatusBadge status={job.payment_status} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Location
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {job.location ?? "Not set"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
