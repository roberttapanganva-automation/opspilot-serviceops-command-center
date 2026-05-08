"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "@/types/api";
import type { InviteAcceptanceResult } from "@/types/domain";

export function AcceptInviteButton({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function acceptInvite() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invitations/accept", {
        body: JSON.stringify({ invitationId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as ApiResponse<InviteAcceptanceResult>;

      if (!response.ok || !result.ok) {
        setError(result.ok ? "Invite acceptance failed." : result.error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Invite acceptance failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p
          className="rounded-lg bg-[var(--ops-danger-soft)] p-3 text-sm text-[var(--ops-danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Button className="w-full sm:w-auto" disabled={isSubmitting} onClick={acceptInvite}>
        {isSubmitting ? "Accepting..." : "Accept invite"}
      </Button>
    </div>
  );
}
