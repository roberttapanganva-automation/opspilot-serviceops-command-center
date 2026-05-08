import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { SettingsAccessReady } from "@/lib/settings/access";
import type { ApiResponse } from "@/types/api";

export function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

export function settingsAccessErrorResponse(error: {
  code: string;
  message: string;
  status: number;
}) {
  return jsonResponse(
    {
      error: {
        code: error.code,
        message: error.message,
      },
      ok: false,
    },
    error.status,
  );
}

export function settingsForbiddenResponse() {
  return jsonResponse(
    {
      error: {
        code: "SETTINGS_FORBIDDEN",
        message: "Your workspace role cannot update these settings.",
      },
      ok: false,
    },
    403,
  );
}

export function settingsValidationErrorResponse(error: ZodError) {
  return jsonResponse(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "Check the settings details and try again.",
        details: error.flatten().fieldErrors,
      },
      ok: false,
    },
    400,
  );
}

export async function writeSettingsAuditLog({
  access,
  action,
  entityId,
  entityType,
  metadata,
}: {
  access: SettingsAccessReady;
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
