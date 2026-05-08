import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getOwnerAccessContext, writeOwnerAuditLog } from "@/lib/owner/access";
import { updateInvitationStatusSchema } from "@/lib/validation/owner";
import type { ApiResponse } from "@/types/api";

type RouteContext = {
  params: Promise<{
    invitationId: string;
  }>;
};

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const { invitationId } = await context.params;
  const invitationIdResult = z.uuid().safeParse(invitationId);

  if (!invitationIdResult.success) {
    return jsonResponse(
      {
        error: {
          code: "INVALID_INVITATION_ID",
          message: "The selected invitation is not valid.",
        },
        ok: false,
      },
      400,
    );
  }

  try {
    const payload = updateInvitationStatusSchema.parse(await request.json());
    const { data: invitation, error } = await access.supabase
      .from("workspace_invitations")
      .update({ status: payload.status })
      .eq("id", invitationIdResult.data)
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .eq("status", "pending")
      .select("id,status")
      .single<{ id: string; status: string }>();

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "INVITATION_UPDATE_FAILED",
            message: "We could not update the pending invite.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeOwnerAuditLog({
      access,
      action: "workspace_invitation.updated",
      entityId: invitation.id,
      entityType: "workspace_invitation",
      metadata: {
        status: invitation.status,
      },
    });

    return jsonResponse({ data: invitation, ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Choose cancelled or expired.",
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
          message: "We could not read the invite update.",
        },
        ok: false,
      },
      400,
    );
  }
}
