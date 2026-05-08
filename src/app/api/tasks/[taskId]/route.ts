import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { canEditOperationalRecords } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import { updateTaskStatusSchema } from "@/lib/validation/tasks";
import type { ApiResponse } from "@/types/api";

type TaskResponse = {
  completed_at: string | null;
  id: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  title: string;
};

type RouteContext = {
  params: Promise<{
    taskId: string;
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

export async function PATCH(request: Request, context: RouteContext) {
  const { taskId } = await context.params;
  const taskIdResult = z.uuid().safeParse(taskId);

  if (!taskIdResult.success) {
    return jsonResponse(
      {
        error: {
          code: "INVALID_TASK_ID",
          message: "The selected task is not valid.",
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
          message: "Sign in to update tasks.",
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

  if (!canEditOperationalRecords(activeWorkspace.context.role)) {
    return jsonResponse(
      {
        error: {
          code: "TASK_UPDATE_FORBIDDEN",
          message: "Your workspace role cannot update tasks.",
        },
        ok: false,
      },
      403,
    );
  }

  try {
    const payload = updateTaskStatusSchema.parse(await request.json());
    const completedAt =
      payload.status === "done" ? new Date().toISOString() : null;

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .update({
        completed_at: completedAt,
        status: payload.status,
        updated_by: user.id,
      })
      .eq("id", taskIdResult.data)
      .eq("workspace_id", activeWorkspace.context.workspace.id)
      .select("id,title,status,completed_at")
      .single<TaskResponse>();

    if (taskError) {
      return jsonResponse(
        {
          error: {
            code: "TASK_UPDATE_FAILED",
            message: "We could not update the task. Please try again.",
            details: taskError.message,
          },
          ok: false,
        },
        500,
      );
    }

    await supabase.from("audit_logs").insert({
      action: "task.updated",
      actor_user_id: user.id,
      entity_id: task.id,
      entity_type: "task",
      metadata: {
        status: task.status,
        title: task.title,
      },
      workspace_id: activeWorkspace.context.workspace.id,
    });

    return jsonResponse({
      data: task,
      ok: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Choose a valid task status.",
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
          message: "We could not read the task update. Please try again.",
        },
        ok: false,
      },
      400,
    );
  }
}
