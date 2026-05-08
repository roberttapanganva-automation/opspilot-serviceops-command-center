import { ChartLineUpIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDateTime } from "@/lib/formatting/date";
import type { DashboardActivityItem } from "@/types/domain";

type RecentActivityProps = {
  items: DashboardActivityItem[];
};

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          description="Workspace actions, audit entries, and automation logs."
          title="Recent Activity"
        />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ops-info-soft)] text-[var(--ops-info)]">
          <ChartLineUpIcon aria-hidden="true" size={24} weight="duotone" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            description="No recent activity yet. Activity logs will appear after workspace actions."
            title="No recent activity"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <article className="flex gap-3" key={`${item.type}-${item.id}`}>
              <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ops-primary)]" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-[var(--ops-text)]">
                    {item.title}
                  </p>
                  <Badge
                    variant={item.type === "automation" ? "info" : "default"}
                  >
                    {item.type === "automation" ? "Automation" : "Audit"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                  {item.message}
                </p>
                <p className="mt-1 text-xs text-[var(--ops-text-muted)]">
                  {formatDateTime(item.created_at)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
