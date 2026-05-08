import Link from "next/link";
import {
  ClockCounterClockwiseIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UserPlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";
import { DangerZonePlaceholder } from "@/components/owner/DangerZonePlaceholder";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getOwnerConsoleOverview } from "@/lib/owner/queries";

const cards = [
  { key: "memberCount", label: "Members", href: "/owner/team", Icon: UsersThreeIcon },
  { key: "pendingInvitationCount", label: "Pending Invites", href: "/owner/invitations", Icon: UserPlusIcon },
  { key: "enabledModuleCount", label: "Enabled Modules", href: "/owner/modules", Icon: SlidersHorizontalIcon },
  { key: "rolePermissionCount", label: "Access Rules", href: "/owner/access-rules", Icon: ShieldCheckIcon },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function OwnerOverviewPage() {
  const overview = await getOwnerConsoleOverview();

  if (!overview) {
    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-[var(--ops-primary-dark)]">
          Owner Console
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ops-text)] sm:text-3xl">
          Workspace ownership controls
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
          Manage team roles, pending invites, workspace controls, access rules,
          and audit visibility for {overview.workspace.name}.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.Icon;
          return (
            <Link href={card.href} key={card.key}>
              <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[var(--ops-text-soft)]">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ops-text)]">
                      {overview[card.key]}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
                    <Icon aria-hidden="true" size={24} weight="duotone" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-[var(--ops-text)]">
                Recent Audit Logs
              </h2>
              <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                Latest real audit events from this workspace.
              </p>
            </div>
            <ClockCounterClockwiseIcon
              aria-hidden="true"
              size={24}
              weight="duotone"
            />
          </div>
          {overview.latestAuditLogs.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                description="Audit rows will appear here after workspace actions are recorded."
                title="No audit logs yet"
              />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {overview.latestAuditLogs.map((log) => (
                <div
                  className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4"
                  key={log.id}
                >
                  <p className="font-semibold text-[var(--ops-text)]">
                    {log.action}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                    {log.entity_type} · {formatDate(log.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
              <PaintBrushIcon aria-hidden="true" size={22} weight="duotone" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--ops-text)]">
                Branding Status
              </h2>
              <p className="text-sm text-[var(--ops-text-soft)]">
                Owner-managed workspace identity.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <Badge variant={overview.brandingConfigured ? "success" : "warning"}>
              {overview.brandingConfigured ? "Configured" : "Default branding"}
            </Badge>
          </div>
        </Card>
      </section>

      <DangerZonePlaceholder />
    </div>
  );
}
