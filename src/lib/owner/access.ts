import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import { canAccessOwnerConsole } from "@/lib/permissions/workspace";
import type { User } from "@supabase/supabase-js";
import type { ActiveWorkspaceContext } from "@/types/domain";

export type OwnerAccessReady = {
  activeWorkspace: ActiveWorkspaceContext;
  status: "ready";
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
};

export type OwnerAccessResult =
  | OwnerAccessReady
  | {
      error: {
        code: string;
        message: string;
        status: number;
      };
      status: "error";
    };

export async function getOwnerAccessContext(): Promise<OwnerAccessResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: {
        code: "UNAUTHORIZED",
        message: "Sign in to access Owner Console.",
        status: 401,
      },
      status: "error",
    };
  }

  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return {
      error: {
        code: "NO_ACTIVE_WORKSPACE",
        message:
          activeWorkspace.error ??
          "No active workspace is available for this account.",
        status: activeWorkspace.status === "error" ? 500 : 403,
      },
      status: "error",
    };
  }

  if (!canAccessOwnerConsole(activeWorkspace.context.role)) {
    return {
      error: {
        code: "OWNER_CONSOLE_FORBIDDEN",
        message: "Owner Console is only available to the workspace owner.",
        status: 403,
      },
      status: "error",
    };
  }

  return {
    activeWorkspace: activeWorkspace.context,
    status: "ready",
    supabase,
    user,
  };
}

export async function writeOwnerAuditLog({
  access,
  action,
  entityId,
  entityType,
  metadata,
}: {
  access: OwnerAccessReady;
  action: string;
  entityId?: string | null;
  entityType: string;
  metadata?: Record<string, unknown>;
}) {
  await access.supabase.from("audit_logs").insert({
    action,
    actor_user_id: access.user.id,
    entity_id: entityId ?? null,
    entity_type: entityType,
    metadata: metadata ?? {},
    workspace_id: access.activeWorkspace.workspace.id,
  });
}
