import { NextResponse } from "next/server";
import { z } from "zod";
import { canDeleteOperationalRecords } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import type { ApiResponse } from "@/types/api";

type DeletedAppointment = {
  id: string;
  title: string;
};

type RouteContext = {
  params: Promise<{
    appointmentId: string;
  }>;
};

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

function getStatusForWorkspaceResult(
  status: "no-user" | "no-workspace" | "error",
) {
  if (status === "no-user") {
    return 401;
  }

  if (status === "no-workspace") {
    return 403;
  }

  return 500;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { appointmentId } = await context.params;
  const appointmentIdResult = z.uuid().safeParse(appointmentId);

  if (!appointmentIdResult.success) {
    return jsonResponse(
      {
        error: {
          code: "INVALID_APPOINTMENT_ID",
          message: "The selected appointment is not valid.",
        },
        ok: false,
      },
      400,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonResponse(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in to delete appointments.",
        },
        ok: false,
      },
      401,
    );
  }

  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return jsonResponse(
      {
        error: {
          code: "NO_ACTIVE_WORKSPACE",
          message:
            activeWorkspace.error ??
            "No active workspace is available for this account.",
        },
        ok: false,
      },
      getStatusForWorkspaceResult(activeWorkspace.status),
    );
  }

  if (!canDeleteOperationalRecords(activeWorkspace.context.role)) {
    return jsonResponse(
      {
        error: {
          code: "APPOINTMENT_DELETE_FORBIDDEN",
          message: "Your workspace role cannot delete appointments.",
        },
        ok: false,
      },
      403,
    );
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentIdResult.data)
    .eq("workspace_id", activeWorkspace.context.workspace.id)
    .select("id,title")
    .single<DeletedAppointment>();

  if (appointmentError) {
    return jsonResponse(
      {
        error: {
          code: "APPOINTMENT_DELETE_FAILED",
          message: "We could not delete the appointment. Please try again.",
          details: appointmentError.message,
        },
        ok: false,
      },
      500,
    );
  }

  await supabase.from("audit_logs").insert({
    action: "appointment.deleted",
    actor_user_id: user.id,
    entity_id: appointment.id,
    entity_type: "appointment",
    metadata: {
      title: appointment.title,
    },
    workspace_id: activeWorkspace.context.workspace.id,
  });

  return jsonResponse({
    data: appointment,
    ok: true,
  });
}
