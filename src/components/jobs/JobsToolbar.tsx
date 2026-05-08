import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function JobsToolbar() {
  return (
    <Card className="p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px]">
        <Input
          id="job-search"
          icon={
            <MagnifyingGlassIcon
              aria-hidden="true"
              size={20}
              weight="regular"
            />
          }
          label="Search jobs"
          placeholder="Search jobs..."
          type="search"
        />

        <div className="relative min-w-0">
          <label className="sr-only" htmlFor="job-status-filter">
            Filter jobs by status
          </label>
          <FunnelSimpleIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
            size={20}
            weight="regular"
          />
          <select
            className="h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pl-9 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
            defaultValue="all"
            id="job-status-filter"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="relative min-w-0">
          <label className="sr-only" htmlFor="job-payment-filter">
            Filter jobs by payment status
          </label>
          <FunnelSimpleIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
            size={20}
            weight="regular"
          />
          <select
            className="h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pl-9 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
            defaultValue="all"
            id="job-payment-filter"
          >
            <option value="all">All payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="not_applicable">Not applicable</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
