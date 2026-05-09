import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getOwnerAccessContext, writeOwnerAuditLog } from "@/lib/owner/access";
import { createPipelineStageSchema } from "@/lib/validation/pipelines";
import type { ApiResponse } from "@/types/api";
import type { PipelineStage } from "@/types/domain";

const pipelineStageSelect =
  "id,workspace_id,pipeline_group_id,entity_type,name,color,order_index,is_closed,is_won,is_lost,created_at,updated_at";

type PipelineGroupLookup = {
  entity_type: "lead" | "job";
  id: string;
  workspace_id: string;
};

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const pipelineGroupId = url.searchParams.get("pipelineGroupId");
  let query = access.supabase
    .from("pipeline_stages")
    .select(pipelineStageSelect)
    .eq("workspace_id", access.activeWorkspace.workspace.id)
    .order("entity_type", { ascending: true })
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (pipelineGroupId) {
    query = query.eq("pipeline_group_id", pipelineGroupId);
  }

  const { data, error } = await query.returns<PipelineStage[]>();

  if (error) {
    return jsonResponse(
      {
        error: {
          code: "PIPELINE_STAGES_LOAD_FAILED",
          message: "We could not load pipeline stages.",
          details: error.message,
        },
        ok: false,
      },
      500,
    );
  }

  return jsonResponse({
    data: data ?? [],
    ok: true,
  });
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
    const payload = createPipelineStageSchema.parse(await request.json());
    const workspaceId = access.activeWorkspace.workspace.id;
    const { data: group, error: groupError } = await access.supabase
      .from("pipeline_groups")
      .select("id,workspace_id,entity_type")
      .eq("id", payload.pipeline_group_id)
      .eq("workspace_id", workspaceId)
      .maybeSingle<PipelineGroupLookup>();

    if (groupError) {
      return jsonResponse(
        {
          error: {
            code: "PIPELINE_GROUP_LOOKUP_FAILED",
            message: "We could not verify the pipeline group.",
            details: groupError.message,
          },
          ok: false,
        },
        500,
      );
    }

    if (!group || group.entity_type !== payload.entity_type) {
      return jsonResponse(
        {
          error: {
            code: "INVALID_PIPELINE_GROUP",
            message:
              "The selected pipeline group is not available for this entity type.",
          },
          ok: false,
        },
        400,
      );
    }

    const { data: stage, error } = await access.supabase
      .from("pipeline_stages")
      .insert({
        color: payload.color,
        entity_type: payload.entity_type,
        is_closed: payload.is_closed,
        is_lost: payload.is_lost,
        is_won: payload.is_won,
        name: payload.name,
        order_index: payload.order_index,
        pipeline_group_id: payload.pipeline_group_id,
        workspace_id: workspaceId,
      })
      .select(pipelineStageSelect)
      .single<PipelineStage>();

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "PIPELINE_STAGE_CREATE_FAILED",
            message: "We could not create the pipeline stage.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeOwnerAuditLog({
      access,
      action: "pipeline_stage.created",
      entityId: stage.id,
      entityType: "pipeline_stage",
      metadata: {
        entity_type: stage.entity_type,
        name: stage.name,
        pipeline_group_id: stage.pipeline_group_id,
      },
    });

    return jsonResponse(
      {
        data: stage,
        ok: true,
      },
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the pipeline stage details and try again.",
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
          message: "We could not read the pipeline stage details.",
          details: error instanceof Error ? error.message : undefined,
        },
        ok: false,
      },
      400,
    );
  }
}
