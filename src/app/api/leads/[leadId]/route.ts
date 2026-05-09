import { NextResponse } from "next/server";
import { z } from "zod";
import { canDeleteOperationalRecords } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import type { ApiResponse } from "@/types/api";

type DeletedLead = {
  id: string;
  title: string;
};

type RouteContext = {
  params: Promise<{
    leadId: string;
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
  const { leadId } = await context.params;
  const leadIdResult = z.uuid().safeParse(leadId);

  if (!leadIdResult.success) {
    return jsonResponse(
      {
        error: {
          code: "INVALID_LEAD_ID",
          message: "The selected lead is not valid.",
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
          message: "Sign in to delete leads.",
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
          code: "LEAD_DELETE_FORBIDDEN",
          message: "Your workspace role cannot delete leads.",
        },
        ok: false,
      },
      403,
    );
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadIdResult.data)
    .eq("workspace_id", activeWorkspace.context.workspace.id)
    .select("id,title")
    .single<DeletedLead>();

  if (leadError) {
    return jsonResponse(
      {
        error: {
          code: "LEAD_DELETE_FAILED",
          message: "We could not delete the lead. Please try again.",
          details: leadError.message,
        },
        ok: false,
      },
      500,
    );
  }

  await supabase.from("audit_logs").insert({
    action: "lead.deleted",
    actor_user_id: user.id,
    entity_id: lead.id,
    entity_type: "lead",
    metadata: {
      title: lead.title,
    },
    workspace_id: activeWorkspace.context.workspace.id,
  });

  return jsonResponse({
    data: lead,
    ok: true,
  });
}
