import { z, ZodError } from "zod";
import { getSettingsAccessContext } from "@/lib/settings/access";
import {
  jsonResponse,
  settingsAccessErrorResponse,
  settingsForbiddenResponse,
  settingsValidationErrorResponse,
  writeSettingsAuditLog,
} from "@/lib/settings/api";
import { updatePipelineStageSchema } from "@/lib/validation/settings";
import type { PipelineStage } from "@/types/domain";

const pipelineStageSelect =
  "id,workspace_id,entity_type,name,color,order_index,is_closed,is_won,is_lost,created_at,updated_at";

type RouteContext = {
  params: Promise<{
    stageId: string;
  }>;
};

async function getStageId(context: RouteContext) {
  const { stageId } = await context.params;

  return z.uuid().parse(stageId);
}

async function stageIsInUse({
  access,
  stageId,
}: {
  access: Awaited<ReturnType<typeof getSettingsAccessContext>> & {
    status: "ready";
  };
  stageId: string;
}) {
  const [leadsResult, jobsResult] = await Promise.all([
    access.supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .eq("stage_id", stageId),
    access.supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .eq("stage_id", stageId),
  ]);

  if (leadsResult.error || jobsResult.error) {
    throw new Error(leadsResult.error?.message ?? jobsResult.error?.message);
  }

  return (leadsResult.count ?? 0) + (jobsResult.count ?? 0) > 0;
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return settingsAccessErrorResponse(access.error);
  }

  if (!access.canManagePipeline) {
    return settingsForbiddenResponse();
  }

  try {
    const stageId = await getStageId(context);
    const payload = updatePipelineStageSchema.parse(await request.json());
    const { data: stage, error } = await access.supabase
      .from("pipeline_stages")
      .update({
        color: payload.color,
        is_closed: payload.is_closed,
        is_lost: payload.is_lost,
        is_won: payload.is_won,
        name: payload.name,
        order_index: payload.order_index,
      })
      .eq("id", stageId)
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .select(pipelineStageSelect)
      .single<PipelineStage>();

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "PIPELINE_STAGE_UPDATE_FAILED",
            message: "We could not update the pipeline stage.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeSettingsAuditLog({
      access,
      action: "pipeline_stage.updated",
      entityId: stage.id,
      entityType: "pipeline_stage",
      metadata: {
        name: stage.name,
      },
    });

    return jsonResponse({
      data: stage,
      ok: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return settingsValidationErrorResponse(error);
    }

    return jsonResponse(
      {
        error: {
          code: "BAD_REQUEST",
          message: "We could not read the pipeline stage settings.",
          details: error instanceof Error ? error.message : undefined,
        },
        ok: false,
      },
      400,
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return settingsAccessErrorResponse(access.error);
  }

  if (!access.canManagePipeline) {
    return settingsForbiddenResponse();
  }

  try {
    const stageId = await getStageId(context);

    if (await stageIsInUse({ access, stageId })) {
      return jsonResponse(
        {
          error: {
            code: "PIPELINE_STAGE_IN_USE",
            message:
              "This stage is currently used by leads or jobs. Move those records before deleting it.",
          },
          ok: false,
        },
        409,
      );
    }

    const { error } = await access.supabase
      .from("pipeline_stages")
      .delete()
      .eq("id", stageId)
      .eq("workspace_id", access.activeWorkspace.workspace.id);

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "PIPELINE_STAGE_DELETE_FAILED",
            message: "We could not delete the pipeline stage.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    await writeSettingsAuditLog({
      access,
      action: "pipeline_stage.deleted",
      entityId: stageId,
      entityType: "pipeline_stage",
    });

    return jsonResponse({
      data: {
        id: stageId,
      },
      ok: true,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: {
          code: "BAD_REQUEST",
          message: "We could not delete the pipeline stage.",
          details: error instanceof Error ? error.message : undefined,
        },
        ok: false,
      },
      400,
    );
  }
}
