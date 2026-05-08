import { ZodError } from "zod";
import { getSettingsAccessContext } from "@/lib/settings/access";
import {
  jsonResponse,
  settingsAccessErrorResponse,
  settingsForbiddenResponse,
  settingsValidationErrorResponse,
  writeSettingsAuditLog,
} from "@/lib/settings/api";
import { updateWorkspaceProfileSchema } from "@/lib/validation/settings";
import type { Workspace } from "@/types/domain";

export async function PATCH(request: Request) {
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return settingsAccessErrorResponse(access.error);
  }

  if (!access.canManageSettings) {
    return settingsForbiddenResponse();
  }

  try {
    const payload = updateWorkspaceProfileSchema.parse(await request.json());
    const { data: workspace, error } = await access.supabase
      .from("workspaces")
      .update({
        currency_code: payload.currency_code,
        industry: payload.industry ?? null,
        name: payload.name,
        timezone: payload.timezone,
      })
      .eq("id", access.activeWorkspace.workspace.id)
      .select(
        "id,name,slug,industry,owner_id,status,currency_code,timezone,created_at,updated_at",
      )
      .single<Workspace>();

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "WORKSPACE_UPDATE_FAILED",
            message: "We could not update the workspace profile.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeSettingsAuditLog({
      access,
      action: "workspace.updated",
      entityId: workspace.id,
      entityType: "workspace",
      metadata: {
        name: workspace.name,
      },
    });

    return jsonResponse({
      data: workspace,
      ok: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return settingsValidationErrorResponse(error);
    }

    return jsonResponse(
      {
        error: {
          code: "BAD_REQUEST",
          message: "We could not read the workspace settings.",
        },
        ok: false,
      },
      400,
    );
  }
}
