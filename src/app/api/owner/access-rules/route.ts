import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getOwnerAccessContext, writeOwnerAuditLog } from "@/lib/owner/access";
import { defaultRolePermissions } from "@/lib/owner/queries";
import { getAssignableRoles } from "@/lib/permissions/workspace";
import { updateWorkspaceRolePermissionSchema } from "@/lib/validation/owner";
import type { ApiResponse } from "@/types/api";
import type { WorkspaceRolePermission } from "@/types/domain";

const permissionSelect =
  "id,workspace_id,role,can_view_settings,can_edit_basic_settings,can_edit_branding,can_manage_modules,can_manage_pipeline,can_create_leads,can_create_jobs,can_create_tasks,can_create_appointments,can_view_audit_logs,created_at,updated_at";

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

async function ensurePermissions(
  access: Awaited<ReturnType<typeof getOwnerAccessContext>> & {
    status: "ready";
  },
) {
  const workspaceId = access.activeWorkspace.workspace.id;
  const { data, error } = await access.supabase
    .from("workspace_role_permissions")
    .select(permissionSelect)
    .eq("workspace_id", workspaceId)
    .returns<WorkspaceRolePermission[]>();

  if (error) {
    throw new Error(error.message);
  }

  const existing = new Set((data ?? []).map((permission) => permission.role));
  const missing = getAssignableRoles()
    .filter((role) => !existing.has(role))
    .map((role) => ({
      ...defaultRolePermissions[role],
      workspace_id: workspaceId,
    }));

  if (missing.length > 0) {
    const { error: insertError } = await access.supabase
      .from("workspace_role_permissions")
      .insert(missing);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const { data: refreshed, error: refreshedError } = await access.supabase
    .from("workspace_role_permissions")
    .select(permissionSelect)
    .eq("workspace_id", workspaceId)
    .order("role", { ascending: true })
    .returns<WorkspaceRolePermission[]>();

  if (refreshedError) {
    throw new Error(refreshedError.message);
  }

  return refreshed ?? [];
}

export async function GET() {
  const access = await getOwnerAccessContext();

  if (access.status !== "ready") {
    return jsonResponse(
      {
        error: {
          code: access.error.code,
          message: access.error.message,
        },
        ok: false,
      },
      access.error.status,
    );
  }

  try {
    return jsonResponse({ data: await ensurePermissions(access), ok: true });
  } catch (error) {
    return jsonResponse(
      {
        error: {
          code: "ACCESS_RULES_LOAD_FAILED",
          message: "We could not load access rules.",
          details: error instanceof Error ? error.message : undefined,
        },
        ok: false,
      },
      500,
    );
  }
}

export async function PATCH(request: Request) {
  const access = await getOwnerAccessContext();

  if (access.status !== "ready") {
    return jsonResponse(
      {
        error: {
          code: access.error.code,
          message: access.error.message,
        },
        ok: false,
      },
      access.error.status,
    );
  }

  try {
    const payload = updateWorkspaceRolePermissionSchema.parse(
      await request.json(),
    );

    for (const permission of payload.permissions) {
      const { error } = await access.supabase
        .from("workspace_role_permissions")
        .upsert(
          {
            ...permission,
            workspace_id: access.activeWorkspace.workspace.id,
          },
          { onConflict: "workspace_id,role" },
        );

      if (error) {
        throw new Error(error.message);
      }
    }

    await writeOwnerAuditLog({
      access,
      action: "workspace_role_permissions.updated",
      entityId: access.activeWorkspace.workspace.id,
      entityType: "workspace_role_permissions",
      metadata: {
        roles: payload.permissions.map((permission) => permission.role),
      },
    });

    return jsonResponse({ data: await ensurePermissions(access), ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the access rule details and try again.",
            details: error.flatten().fieldErrors,
          },
          ok: false,
        },
        400,
      );
    }

    return jsonResponse(
      {
        error: {
          code: "ACCESS_RULES_UPDATE_FAILED",
          message: "We could not update access rules.",
          details: error instanceof Error ? error.message : undefined,
        },
        ok: false,
      },
      500,
    );
  }
}
