import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import { getPipelineBoardForActiveWorkspace } from "@/lib/pipelines/queries";
import type { ApiResponse } from "@/types/api";
import type { PipelineBoard } from "@/types/domain";

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

function getWorkspaceStatusCode(status: "no-user" | "no-workspace" | "error") {
  if (status === "no-user") {
    return 401;
  }

  if (status === "no-workspace") {
    return 403;
  }

  return 500;
}

export async function GET(request: Request) {
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
          message: "Sign in to view pipelines.",
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
      getWorkspaceStatusCode(activeWorkspace.status),
    );
  }

  try {
    const url = new URL(request.url);
    const board = await getPipelineBoardForActiveWorkspace(
      url.searchParams.get("pipeline") ?? undefined,
    );

    return jsonResponse<PipelineBoard>({
      data: board,
      ok: true,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: {
          code: "PIPELINE_BOARD_LOAD_FAILED",
          message: "We could not load the pipeline board.",
          details: error instanceof Error ? error.message : undefined,
        },
        ok: false,
      },
      500,
    );
  }
}
