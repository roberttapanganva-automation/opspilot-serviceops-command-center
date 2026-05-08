import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getOwnerAccessContext, writeOwnerAuditLog } from "@/lib/owner/access";
import { updateMemberRoleSchema } from "@/lib/validation/owner";
import type { ApiResponse } from "@/types/api";

type RouteContext = {
  params: Promise<{
    memberId: string;
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

  const { memberId } = await context.params;
  const memberIdResult = z.uuid().safeParse(memberId);

  if (!memberIdResult.success) {
    return jsonResponse(
      {
        error: {
          code: "INVALID_MEMBER_ID",
          message: "The selected member is not valid.",
        },
        ok: false,
      },
      400,
    );
  }

  try {
    const payload = updateMemberRoleSchema.parse(await request.json());
    const { data: member, error: memberError } = await access.supabase
      .from("workspace_members")
      .select("id,user_id,role")
      .eq("id", memberIdResult.data)
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .single<{ id: string; role: string; user_id: string }>();

    if (memberError) {
      return jsonResponse(
        {
          error: {
            code: "MEMBER_NOT_FOUND",
            message: "The selected member is not available in this workspace.",
            details: memberError.message,
          },
          ok: false,
        },
        404,
      );
    }

    if (member.role === "owner" || member.user_id === access.user.id) {
      return jsonResponse(
        {
          error: {
            code: "OWNER_ROLE_LOCKED",
            message: "Owner role changes and self-demotion are not available in this patch.",
          },
          ok: false,
        },
        403,
      );
    }

    const { data: updatedMember, error: updateError } = await access.supabase
      .from("workspace_members")
      .update({ role: payload.role })
      .eq("id", member.id)
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .select("id,role")
      .single<{ id: string; role: string }>();

    if (updateError) {
      return jsonResponse(
        {
          error: {
            code: "MEMBER_ROLE_UPDATE_FAILED",
            message: "We could not update the member role.",
            details: updateError.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeOwnerAuditLog({
      access,
      action: "member.role_updated",
      entityId: updatedMember.id,
      entityType: "workspace_member",
      metadata: {
        role: updatedMember.role,
      },
    });

    return jsonResponse({ data: updatedMember, ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Choose a valid non-owner role.",
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
          message: "We could not read the role update.",
        },
        ok: false,
      },
      400,
    );
  }
}
