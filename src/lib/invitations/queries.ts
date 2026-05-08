import { createClient } from "@/lib/supabase/server";
import type {
  InviteAcceptanceDisplay,
  InviteAcceptanceState,
  WorkspaceInvitation,
} from "@/types/domain";

function isExpired(expiresAt: string | null) {
  return expiresAt ? new Date(expiresAt).getTime() < Date.now() : false;
}

function buildDisplay(
  invitation: WorkspaceInvitation,
  workspaceName: string | null,
): InviteAcceptanceDisplay {
  return {
    expires_at: invitation.expires_at,
    id: invitation.id,
    invited_email: invitation.invited_email,
    role: invitation.role,
    status: invitation.status,
    workspaceName,
  };
}

export async function getInvitationForCurrentUser(
  invitationId: string,
): Promise<InviteAcceptanceState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      invitationId,
      message: "Sign in with the invited email address to view this invite.",
      status: "unauthenticated",
    };
  }

  const { data: invitation, error } = await supabase
    .from("workspace_invitations")
    .select(
      "id,workspace_id,invited_email,role,status,invited_by,accepted_by,accepted_at,expires_at,created_at,updated_at",
    )
    .eq("id", invitationId)
    .maybeSingle<WorkspaceInvitation>();

  if (error || !invitation) {
    return {
      invitationId,
      message: "This invite is not available for the signed-in account.",
      status: "invalid",
    };
  }

  if (invitation.invited_email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return {
      invitationId,
      message: "This invite belongs to a different email address.",
      status: "email_mismatch",
    };
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", invitation.workspace_id)
    .maybeSingle<{ name: string }>();

  const display = buildDisplay(invitation, workspace?.name ?? null);

  if (invitation.status === "accepted") {
    return {
      invitation: display,
      invitationId,
      message: "This invite has already been accepted.",
      status: "accepted",
    };
  }

  if (invitation.status === "cancelled") {
    return {
      invitation: display,
      invitationId,
      message: "This invite has been cancelled.",
      status: "cancelled",
    };
  }

  if (invitation.status === "expired" || isExpired(invitation.expires_at)) {
    return {
      invitation: display,
      invitationId,
      message: "This invite has expired.",
      status: "expired",
    };
  }

  return {
    invitation: display,
    invitationId,
    message: "Review the invite details before joining the workspace.",
    status: "pending",
  };
}
