import { ZodError } from "zod";
import { getSettingsAccessContext } from "@/lib/settings/access";
import {
  jsonResponse,
  settingsAccessErrorResponse,
  settingsForbiddenResponse,
  settingsValidationErrorResponse,
  writeSettingsAuditLog,
} from "@/lib/settings/api";
import { createPipelineStageSchema } from "@/lib/validation/settings";
import type { PipelineStage } from "@/types/domain";

const pipelineStageSelect =
  "id,workspace_id,entity_type,name,color,order_index,is_closed,is_won,is_lost,created_at,updated_at";

export async function GET() {
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return settingsAccessErrorResponse(access.error);
  }

  const { data, error } = await access.supabase
    .from("pipeline_stages")
    .select(pipelineStageSelect)
    .eq("workspace_id", access.activeWorkspace.workspace.id)
    .order("entity_type", { ascending: true })
    .order("order_index", { ascending: true })
    .returns<PipelineStage[]>();

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
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return settingsAccessErrorResponse(access.error);
  }

  if (!access.canManagePipeline) {
    return settingsForbiddenResponse();
  }

  try {
    const payload = createPipelineStageSchema.parse(await request.json());
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
        workspace_id: access.activeWorkspace.workspace.id,
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

    await writeSettingsAuditLog({
      access,
      action: "pipeline_stage.created",
      entityId: stage.id,
      entityType: "pipeline_stage",
      metadata: {
        entity_type: stage.entity_type,
        name: stage.name,
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
      return settingsValidationErrorResponse(error);
    }

    return jsonResponse(
      {
        error: {
          code: "BAD_REQUEST",
          message: "We could not read the pipeline stage settings.",
        },
        ok: false,
      },
      400,
    );
  }
}
