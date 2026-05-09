import { MemberActivityBadge } from "@/components/owner/team/MemberActivityBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { WorkspaceMemberWithProfile, WorkspaceRole } from "@/types/domain";

const roleGroups: Array<{ role: WorkspaceRole; title: string }> = [
  { role: "owner", title: "Owner" },
  { role: "admin", title: "Admins" },
  { role: "manager", title: "Managers" },
  { role: "staff", title: "Staff" },
  { role: "viewer", title: "Viewers" },
];

function memberName(member: WorkspaceMemberWithProfile) {
  return member.user.full_name ?? member.user.email ?? "Workspace member";
}

export function TeamVisibility({
  members,
}: {
  members: WorkspaceMemberWithProfile[];
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-[var(--ops-text)]">
          Team visibility
        </h2>
        <p className="text-sm leading-6 text-[var(--ops-text-soft)]">
          Read-only member list and last-active status. Role changes remain in
          Owner Console.
        </p>
      </div>

      {members.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="No active workspace members were returned."
            title="No members visible"
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {roleGroups.map(({ role, title }) => {
            const groupedMembers = members.filter(
              (member) => member.role === role,
            );

            if (groupedMembers.length === 0) {
              return null;
            }

            return (
              <section
                className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4"
                key={role}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[var(--ops-text)]">
                    {title}
                  </h3>
                  <Badge>{groupedMembers.length}</Badge>
                </div>
                <div className="mt-3 space-y-3">
                  {groupedMembers.map((member) => (
                    <article
                      className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] p-3"
                      key={member.id}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--ops-text)]">
                            {memberName(member)}
                          </p>
                          <p className="mt-1 truncate text-xs text-[var(--ops-text-soft)]">
                            {member.user.email ?? "Email not available"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              member.status === "active" ? "success" : "warning"
                            }
                          >
                            {member.status}
                          </Badge>
                          <MemberActivityBadge lastSeenAt={member.last_seen_at} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </Card>
  );
}
