import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function LeadsToolbar() {
  return (
    <Card className="p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px]">
        <Input
          id="lead-search"
          icon={
            <MagnifyingGlassIcon
              aria-hidden="true"
              size={20}
              weight="regular"
            />
          }
          label="Search leads"
          placeholder="Search leads..."
          type="search"
        />

        <div className="relative min-w-0">
          <label className="sr-only" htmlFor="lead-status-filter">
            Filter leads by status
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
            id="lead-status-filter"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="relative min-w-0">
          <label className="sr-only" htmlFor="lead-priority-filter">
            Filter leads by priority
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
            id="lead-priority-filter"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
