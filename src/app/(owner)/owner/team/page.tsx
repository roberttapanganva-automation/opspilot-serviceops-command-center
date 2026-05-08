import { MembersByRole } from "@/components/owner/team/MembersByRole";
import { getWorkspaceMembersGroupedByRole } from "@/lib/owner/queries";

export default async function OwnerTeamPage() {
  const members = await getWorkspaceMembersGroupedByRole();

  if (!members) {
    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-[var(--ops-text)]">
          Team
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
          Review workspace members, last active status, and assign safe
          non-owner roles. Owner transfer is intentionally not available here.
        </p>
      </section>
      <MembersByRole members={members} />
    </div>
  );
}
