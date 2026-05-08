import { InviteMemberForm } from "@/components/owner/invitations/InviteMemberForm";
import { InvitationsList } from "@/components/owner/invitations/InvitationsList";
import { getWorkspaceInvitations } from "@/lib/owner/queries";

export default async function OwnerInvitationsPage() {
  const invitations = await getWorkspaceInvitations();

  if (!invitations) {
    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-[var(--ops-text)]">
          Invitations
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
          Create and manage invite records. No email is sent and no user account
          or membership row is created in this patch.
        </p>
      </section>
      <InviteMemberForm />
      <InvitationsList invitations={invitations} />
    </div>
  );
}
