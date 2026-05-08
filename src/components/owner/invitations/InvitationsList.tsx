"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiResponse } from "@/types/api";
import type { WorkspaceInvitation } from "@/types/domain";

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function InvitationsList({
  invitations,
}: {
  invitations: WorkspaceInvitation[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  async function copyInviteLink(invitationId: string) {
    setMessage(null);
    setCopyingId(invitationId);

    try {
      const link = `${window.location.origin}/invite/${invitationId}`;
      await navigator.clipboard.writeText(link);
      setMessage("Invite link copied.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invite link copy failed.");
    } finally {
      setCopyingId(null);
    }
  }

  async function cancelInvitation(invitationId: string) {
    setMessage(null);
    setBusyId(invitationId);

    try {
      const response = await fetch(`/api/owner/invitations/${invitationId}`, {
        body: JSON.stringify({ status: "cancelled" }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const result = (await response.json()) as ApiResponse<{ id: string }>;

      if (!response.ok || !result.ok) {
        setMessage(result.ok ? "Invite update failed." : result.error.message);
        return;
      }

      setMessage("Invite cancelled.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invite update failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-[var(--ops-text)]">Invitations</h2>
        <p className="text-sm text-[var(--ops-text-soft)]">
          These are invite records only. They do not send email or create users yet.
        </p>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg bg-[var(--ops-card-soft)] p-3 text-sm text-[var(--ops-text-soft)]">
          {message}
        </p>
      ) : null}

      {invitations.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="Invite records will appear here after the owner creates them."
            title="No invitations yet"
          />
        </div>
      ) : (
        <div className="mt-5 divide-y divide-[var(--ops-border)] overflow-hidden rounded-lg border border-[var(--ops-border)]">
          {invitations.map((invitation) => (
            <article className="bg-white p-4" key={invitation.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--ops-text)]">
                    {invitation.invited_email}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                    Role: {invitation.role} · Invited {formatDate(invitation.created_at)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ops-text-muted)]">
                    Expires {formatDate(invitation.expires_at)} · Invited by {invitation.invited_by ?? "unknown"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={invitation.status === "pending" ? "info" : "warning"}>
                    {invitation.status}
                  </Badge>
                  {invitation.status === "pending" ? (
                    <>
                      <Button
                        disabled={copyingId === invitation.id}
                        onClick={() => copyInviteLink(invitation.id)}
                        variant="secondary"
                      >
                        {copyingId === invitation.id ? "Copying..." : "Copy invite link"}
                      </Button>
                      <Button
                        disabled={busyId === invitation.id}
                        onClick={() => cancelInvitation(invitation.id)}
                        variant="secondary"
                      >
                        {busyId === invitation.id ? "Cancelling..." : "Cancel"}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
