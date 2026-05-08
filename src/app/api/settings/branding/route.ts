import { ZodError } from "zod";
import { getSettingsAccessContext } from "@/lib/settings/access";
import {
  jsonResponse,
  settingsAccessErrorResponse,
  settingsForbiddenResponse,
  settingsValidationErrorResponse,
  writeSettingsAuditLog,
} from "@/lib/settings/api";
import { updateWorkspaceBrandingSchema } from "@/lib/validation/settings";
import type { WorkspaceBrandingSettings } from "@/types/domain";

export async function PATCH(request: Request) {
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return settingsAccessErrorResponse(access.error);
  }

  if (!access.canManageBranding) {
    return settingsForbiddenResponse();
  }

  try {
    const payload = updateWorkspaceBrandingSchema.parse(await request.json());
    const { data: branding, error } = await access.supabase
      .from("workspace_branding")
      .upsert(
        {
          accent_color: payload.accent_color,
          app_name: payload.app_name,
          icon_url: payload.icon_url ?? null,
          login_heading: payload.login_heading ?? null,
          login_subtext: payload.login_subtext ?? null,
          logo_url: payload.logo_url ?? null,
          primary_color: payload.primary_color,
          theme_mode: payload.theme_mode,
          workspace_id: access.activeWorkspace.workspace.id,
        },
        {
          onConflict: "workspace_id",
        },
      )
      .select(
        "workspace_id,app_name,logo_url,icon_url,primary_color,accent_color,login_heading,login_subtext,theme_mode,created_at,updated_at",
      )
      .single<WorkspaceBrandingSettings>();

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "BRANDING_UPDATE_FAILED",
            message: "We could not update workspace branding.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeSettingsAuditLog({
      access,
      action: "workspace_branding.updated",
      entityId: access.activeWorkspace.workspace.id,
      entityType: "workspace_branding",
      metadata: {
        app_name: branding.app_name,
      },
    });

    return jsonResponse({
      data: branding,
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
          message: "We could not read the branding settings.",
        },
        ok: false,
      },
      400,
    );
  }
}
