import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getOwnerAccessContext, writeOwnerAuditLog } from "@/lib/owner/access";
import { updateWorkspaceBrandingSchema } from "@/lib/validation/branding";
import type { ApiResponse } from "@/types/api";
import type { WorkspaceBrandingSettings } from "@/types/domain";

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
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

    await writeOwnerAuditLog({
      access,
      action: "workspace_branding.updated",
      entityId: access.activeWorkspace.workspace.id,
      entityType: "workspace_branding",
      metadata: {
        app_name: branding.app_name,
        icon_url: Boolean(branding.icon_url),
        logo_url: Boolean(branding.logo_url),
        theme_mode: branding.theme_mode,
      },
    });

    return jsonResponse({
      data: branding,
      ok: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the branding details and try again.",
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
          code: "BAD_REQUEST",
          message: "We could not read the branding details.",
        },
        ok: false,
      },
      400,
    );
  }
}
