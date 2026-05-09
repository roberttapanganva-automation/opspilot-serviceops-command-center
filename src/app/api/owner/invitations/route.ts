import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getOwnerAccessContext, writeOwnerAuditLog } from "@/lib/owner/access";
import { createWorkspaceInvitationSchema } from "@/lib/validation/owner";
import type { ApiResponse } from "@/types/api";
import type { WorkspaceInvitation } from "@/types/domain";

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

function getInvitationCreateErrorMessage(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  if (
    normalizedMessage.includes("duplicate key") ||
    normalizedMessage.includes("idx_workspace_invitations_pending_email")
  ) {
    return "A pending invite already exists for this email. Copy the existing invite link or cancel it first.";
  }

  return "We could not create the invite record.";
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

  const { data, error } = await access.supabase
    .from("workspace_invitations")
    .select(
      "id,workspace_id,invited_email,role,status,invited_by,accepted_by,accepted_at,expires_at,created_at,updated_at",
    )
    .eq("workspace_id", access.activeWorkspace.workspace.id)
    .order("created_at", { ascending: false })
    .returns<WorkspaceInvitation[]>();

  if (error) {
    return jsonResponse(
      {
        error: {
          code: "INVITATIONS_LOAD_FAILED",
          message: "We could not load invitations.",
          details: error.message,
        },
        ok: false,
      },
      500,
    );
  }

  return jsonResponse({ data: data ?? [], ok: true });
}

export async function POST(request: Request) {
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
    const payload = createWorkspaceInvitationSchema.parse(await request.json());
    const { data: invitation, error } = await access.supabase
      .from("workspace_invitations")
      .insert({
        expires_at: payload.expires_at ?? null,
        invited_by: access.user.id,
        invited_email: payload.invited_email,
        role: payload.role,
        status: "pending",
        workspace_id: access.activeWorkspace.workspace.id,
      })
      .select(
        "id,workspace_id,invited_email,role,status,invited_by,accepted_by,accepted_at,expires_at,created_at,updated_at",
      )
      .single<WorkspaceInvitation>();

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "INVITATION_CREATE_FAILED",
            message: getInvitationCreateErrorMessage(error.message),
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeOwnerAuditLog({
      access,
      action: "workspace_invitation.created",
      entityId: invitation.id,
      entityType: "workspace_invitation",
      metadata: {
        invited_email: invitation.invited_email,
        role: invitation.role,
      },
    });

    return jsonResponse({ data: invitation, ok: true }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the invite details and try again.",
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
          message: "We could not read the invite details.",
        },
        ok: false,
      },
      400,
    );
  }
}
