import { ZodError } from "zod";
import { getSettingsAccessContext } from "@/lib/settings/access";
import {
  jsonResponse,
  settingsAccessErrorResponse,
  settingsForbiddenResponse,
  settingsValidationErrorResponse,
  writeSettingsAuditLog,
} from "@/lib/settings/api";
import { updateWorkspaceModulesSchema } from "@/lib/validation/settings";
import type { WorkspaceModuleSettings } from "@/types/domain";

export async function PATCH(request: Request) {
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return settingsAccessErrorResponse(access.error);
  }

  if (!access.canManageModules) {
    return settingsForbiddenResponse();
  }

  try {
    const payload = updateWorkspaceModulesSchema.parse(await request.json());
    const { data: modules, error } = await access.supabase
      .from("workspace_modules")
      .upsert(
        {
          ...payload,
          workspace_id: access.activeWorkspace.workspace.id,
        },
        {
          onConflict: "workspace_id",
        },
      )
      .select(
        "workspace_id,leads_enabled,jobs_enabled,tasks_enabled,calendar_enabled,reports_enabled,automations_enabled,ai_enabled,invoices_enabled,created_at,updated_at",
      )
      .single<WorkspaceModuleSettings>();

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "MODULES_UPDATE_FAILED",
            message: "We could not update workspace modules.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeSettingsAuditLog({
      access,
      action: "workspace_modules.updated",
      entityId: access.activeWorkspace.workspace.id,
      entityType: "workspace_modules",
      metadata: {
        enabled_modules: Object.entries(payload)
          .filter(([, enabled]) => enabled)
          .map(([module]) => module),
      },
    });

    return jsonResponse({
      data: modules,
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
          message: "We could not read the module settings.",
        },
        ok: false,
      },
      400,
    );
  }
}
