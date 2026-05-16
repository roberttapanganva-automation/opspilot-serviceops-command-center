import {
  BriefcaseIcon,
  CalendarBlankIcon,
  CheckSquareIcon,
  GearSixIcon,
  KanbanIcon,
  PaletteIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDateTime } from "@/lib/formatting/date";
import type { DashboardActivityItem } from "@/types/domain";

type RecentActivityProps = {
  items: DashboardActivityItem[];
};

function ActivityRowIcon({ icon }: { icon: string }) {
  const props = {
    className: "text-[var(--workspace-primary,var(--ops-primary-dark))]",
    size: 18,
    weight: "duotone" as const,
  };

  switch (icon) {
    case "lead":
      return <UsersThreeIcon aria-hidden="true" {...props} />;
    case "job":
      return <BriefcaseIcon aria-hidden="true" {...props} />;
    case "task":
      return <CheckSquareIcon aria-hidden="true" {...props} />;
    case "calendar":
      return <CalendarBlankIcon aria-hidden="true" {...props} />;
    case "branding":
      return <PaletteIcon aria-hidden="true" {...props} />;
    case "access":
      return <ShieldCheckIcon aria-hidden="true" {...props} />;
    case "team":
      return <UsersThreeIcon aria-hidden="true" {...props} />;
    case "pipeline":
      return <KanbanIcon aria-hidden="true" {...props} />;
    default:
      return <GearSixIcon aria-hidden="true" {...props} />;
  }
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          description="Review the latest operational changes so owners and staff can stay aligned without chasing updates."
          title="Recent Activity"
        />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ops-card-soft)] text-[#7B8794]">
          <svg
            aria-hidden="true"
            className="h-6 w-6 fill-current"
            viewBox="0 0 256 256"
          >
            <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z" />
          </svg>
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
              <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--workspace-primary-soft,var(--ops-primary-soft))]">
                <ActivityRowIcon icon={item.icon} />
              </div>
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
