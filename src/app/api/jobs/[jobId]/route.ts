import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import {
  canDeleteOperationalRecords,
  canEditOperationalRecords,
} from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import { updateJobSchema } from "@/lib/validation/jobs";
import type { ApiResponse } from "@/types/api";

type DeletedJob = {
  id: string;
  title: string;
};

type UpdatedJob = DeletedJob & {
  estimated_value: number | string;
  location: string | null;
  payment_status: "unpaid" | "partial" | "paid" | "refunded" | "not_applicable";
  service_type: string | null;
  status: "draft" | "scheduled" | "in_progress" | "completed" | "cancelled";
};

type RouteContext = {
  params: Promise<{
    jobId: string;
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
  const { jobId } = await context.params;
  const jobIdResult = z.uuid().safeParse(jobId);

  if (!jobIdResult.success) {
    return jsonResponse(
      {
        error: {
          code: "INVALID_JOB_ID",
          message: "The selected job is not valid.",
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
          message: "Sign in to update jobs.",
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
          code: "JOB_UPDATE_FORBIDDEN",
          message: "Your workspace role cannot update jobs.",
        },
        ok: false,
      },
      403,
    );
  }

  try {
    const payload = updateJobSchema.parse(await request.json());
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .update({
        estimated_value: payload.estimated_value,
        location: payload.location ?? null,
        payment_status: payload.payment_status,
        service_type: payload.service_type ?? null,
        status: payload.status,
        title: payload.title,
        updated_by: user.id,
      })
      .eq("id", jobIdResult.data)
      .eq("workspace_id", activeWorkspace.context.workspace.id)
      .select("id,title,service_type,location,estimated_value,payment_status,status")
      .single<UpdatedJob>();

    if (jobError) {
      return jsonResponse(
        {
          error: {
            code: "JOB_UPDATE_FAILED",
            message: "We could not update the job. Please try again.",
            details: jobError.message,
          },
          ok: false,
        },
        500,
      );
    }

    await supabase.from("audit_logs").insert({
      action: "job.updated",
      actor_user_id: user.id,
      entity_id: job.id,
      entity_type: "job",
      metadata: {
        status: job.status,
        title: job.title,
      },
      workspace_id: activeWorkspace.context.workspace.id,
    });

    return jsonResponse({
      data: job,
      ok: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the job details and try again.",
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
          message: "We could not read the job update. Please try again.",
        },
        ok: false,
      },
      400,
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  const jobIdResult = z.uuid().safeParse(jobId);

  if (!jobIdResult.success) {
    return jsonResponse(
      {
        error: {
          code: "INVALID_JOB_ID",
          message: "The selected job is not valid.",
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
          message: "Sign in to delete jobs.",
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
          code: "JOB_DELETE_FORBIDDEN",
          message: "Your workspace role cannot delete jobs.",
        },
        ok: false,
      },
      403,
    );
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobIdResult.data)
    .eq("workspace_id", activeWorkspace.context.workspace.id)
    .select("id,title")
    .single<DeletedJob>();

  if (jobError) {
    return jsonResponse(
      {
        error: {
          code: "JOB_DELETE_FAILED",
          message: "We could not delete the job. Please try again.",
          details: jobError.message,
        },
        ok: false,
      },
      500,
    );
  }

  await supabase.from("audit_logs").insert({
    action: "job.deleted",
    actor_user_id: user.id,
    entity_id: job.id,
    entity_type: "job",
    metadata: {
      title: job.title,
    },
    workspace_id: activeWorkspace.context.workspace.id,
  });

  return jsonResponse({
    data: job,
    ok: true,
  });
}
