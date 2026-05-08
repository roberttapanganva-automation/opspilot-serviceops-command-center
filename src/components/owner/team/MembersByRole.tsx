import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { WorkspaceMemberWithProfile, WorkspaceRole } from "@/types/domain";
import { MemberActivityBadge } from "./MemberActivityBadge";
import { MemberRoleSelect } from "./MemberRoleSelect";

const roleGroups: Array<{ role: WorkspaceRole; title: string }> = [
  { role: "admin", title: "Admins" },
  { role: "manager", title: "Managers" },
  { role: "staff", title: "Staff" },
  { role: "viewer", title: "Viewers" },
];

function formatDate(value: string | null) {
  if (!value) {
    return "Not accepted";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function memberName(member: WorkspaceMemberWithProfile) {
  return member.user.full_name ?? member.user.email ?? "Workspace member";
}

export function MembersByRole({
  members,
}: {
  members: WorkspaceMemberWithProfile[];
}) {
  const owner = members.find((member) => member.role === "owner");

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <p className="text-sm font-semibold text-[var(--ops-primary-dark)]">
          Workspace Owner
        </p>
        {owner ? (
          <div className="mt-4 flex flex-col gap-4 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-[var(--ops-text)]">
                {memberName(owner)}
              </h2>
              <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                {owner.user.email ?? "Email not available from profile"}
              </p>
              <p className="mt-1 text-xs text-[var(--ops-text-muted)]">
                Joined {formatDate(owner.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">Owner</Badge>
              <MemberActivityBadge lastSeenAt={owner.last_seen_at} />
            </div>
          </div>
        ) : (
          <EmptyState
            description="No owner membership row was returned for this workspace."
            title="Owner not found"
          />
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {roleGroups.map(({ role, title }) => {
          const groupedMembers = members.filter((member) => member.role === role);

          return (
            <Card className="p-5 sm:p-6" key={role}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-[var(--ops-text)]">{title}</h2>
                <Badge>{groupedMembers.length}</Badge>
              </div>

              {groupedMembers.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    description={`No ${title.toLowerCase()} are assigned in this workspace.`}
                    title={`No ${title.toLowerCase()}`}
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {groupedMembers.map((member) => (
                    <article
                      className="rounded-lg border border-[var(--ops-border)] bg-white p-4"
                      key={member.id}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[var(--ops-text)]">
                            {memberName(member)}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                            {member.user.email ?? "Email not available from profile"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant={member.status === "active" ? "success" : "warning"}>
                              {member.status}
                            </Badge>
                            <MemberActivityBadge lastSeenAt={member.last_seen_at} />
                          </div>
                          <p className="mt-3 text-xs text-[var(--ops-text-muted)]">
                            Joined {formatDate(member.created_at)}
                          </p>
                        </div>
                        <MemberRoleSelect memberId={member.id} role={member.role} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
