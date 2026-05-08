import { InviteAcceptanceCard } from "@/components/invitations/InviteAcceptanceCard";
import { getInvitationForCurrentUser } from "@/lib/invitations/queries";

type InvitePageProps = {
  params: Promise<{
    invitationId: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { invitationId } = await params;
  const state = await getInvitationForCurrentUser(invitationId);

  return (
    <main className="min-h-screen bg-[var(--ops-main-bg)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <InviteAcceptanceCard state={state} />
      </div>
    </main>
  );
}
