import Link from "next/link";
import {
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import { AcceptInviteButton } from "@/components/invitations/AcceptInviteButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { InviteAcceptanceState } from "@/types/domain";

function formatDate(value: string | null) {
  if (!value) {
    return "No expiration set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getBadgeVariant(status: InviteAcceptanceState["status"]) {
  if (status === "accepted") {
    return "success";
  }

  if (status === "pending") {
    return "info";
  }

  if (status === "expired" || status === "cancelled") {
    return "warning";
  }

  return "danger";
}

function getStatusIcon(status: InviteAcceptanceState["status"]) {
  if (status === "accepted") {
    return <CheckCircleIcon aria-hidden="true" size={22} weight="regular" />;
  }

  if (status === "pending") {
    return <ShieldCheckIcon aria-hidden="true" size={22} weight="regular" />;
  }

  return <WarningCircleIcon aria-hidden="true" size={22} weight="regular" />;
}

export function InviteAcceptanceCard({ state }: { state: InviteAcceptanceState }) {
  const invite = state.invitation;

  return (
    <Card className="w-full max-w-xl p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]">
          {getStatusIcon(state.status)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[var(--ops-text)]">
              Workspace invite
            </h1>
            <Badge variant={getBadgeVariant(state.status)}>{state.status}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--ops-text-soft)]">
            {state.message}
          </p>
        </div>
      </div>

      {invite ? (
        <dl className="mt-6 grid gap-3 rounded-xl border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--ops-text-muted)]">Workspace</dt>
            <dd className="font-medium text-[var(--ops-text)]">
              {invite.workspaceName ?? "Workspace access will load after acceptance"}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--ops-text-muted)]">Invited email</dt>
            <dd className="flex items-center gap-2 font-medium text-[var(--ops-text)]">
              <EnvelopeSimpleIcon aria-hidden="true" size={16} weight="regular" />
              {invite.invited_email}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--ops-text-muted)]">Assigned role</dt>
            <dd className="font-medium capitalize text-[var(--ops-text)]">
              {invite.role}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-[var(--ops-text-muted)]">Expires</dt>
            <dd className="font-medium text-[var(--ops-text)]">
              {formatDate(invite.expires_at)}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {state.status === "pending" ? (
          <AcceptInviteButton invitationId={state.invitationId} />
        ) : null}
        {state.status === "unauthenticated" ? (
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--ops-primary)] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_var(--ops-primary-glow)] transition hover:bg-[var(--ops-primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
            href={`/login?redirect=${encodeURIComponent(`/invite/${state.invitationId}`)}`}
          >
            Sign in to continue
          </Link>
        ) : null}
        {state.status === "accepted" ? (
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--ops-primary)] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_var(--ops-primary-glow)] transition hover:bg-[var(--ops-primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
