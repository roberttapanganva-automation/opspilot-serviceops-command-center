import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { acceptInvitationSchema } from "@/lib/validation/invitations";
import type { ApiResponse } from "@/types/api";
import type { InviteAcceptanceResult } from "@/types/domain";

const errorMessages: Record<string, string> = {
  email_mismatch: "This invite belongs to a different email address.",
  invalid_invitation: "This invite is not available.",
  invitation_already_accepted: "This invite has already been accepted.",
  invitation_expired: "This invite has expired.",
  invitation_not_pending: "This invite is no longer pending.",
  not_authenticated: "Sign in with the invited email address to accept this invite.",
  unknown_error: "We could not accept this invite. Please try again.",
};

const errorStatuses: Record<string, number> = {
  email_mismatch: 403,
  invalid_invitation: 404,
  invitation_already_accepted: 409,
  invitation_expired: 410,
  invitation_not_pending: 409,
  not_authenticated: 401,
  unknown_error: 500,
};

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

function normalizeRpcError(message: string | undefined) {
  const normalized = message ?? "";

  for (const code of Object.keys(errorMessages)) {
    if (normalized.includes(code)) {
      return code;
    }
  }

  return "unknown_error";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse(
      {
        error: {
          code: "not_authenticated",
          message: errorMessages.not_authenticated,
        },
        ok: false,
      },
      errorStatuses.not_authenticated,
    );
  }

  try {
    const payload = acceptInvitationSchema.parse(await request.json());
    const { data, error } = await supabase.rpc("accept_workspace_invitation", {
      target_invitation_id: payload.invitationId,
    });

    if (error) {
      const code = normalizeRpcError(error.message);

      return jsonResponse(
        {
          error: {
            code,
            message: errorMessages[code],
            details: error.message,
          },
          ok: false,
        },
        errorStatuses[code],
      );
    }

    return jsonResponse({
      data: data as InviteAcceptanceResult,
      ok: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "invalid_invitation",
            message: "The invite link is invalid.",
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
          code: "unknown_error",
          message: errorMessages.unknown_error,
        },
        ok: false,
      },
      500,
    );
  }
}
