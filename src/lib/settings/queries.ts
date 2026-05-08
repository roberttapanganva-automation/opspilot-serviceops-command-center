import { getSettingsAccessContext } from "@/lib/settings/access";
import type { PipelineStage, WorkspaceSettingsData } from "@/types/domain";

export async function getSettingsForActiveWorkspace(): Promise<WorkspaceSettingsData | null> {
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return null;
  }

  const { data: pipelineStages, error: pipelineStagesError } =
    await access.supabase
      .from("pipeline_stages")
      .select(
        "id,workspace_id,entity_type,name,color,order_index,is_closed,is_won,is_lost,created_at,updated_at",
      )
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .order("entity_type", { ascending: true })
      .order("order_index", { ascending: true })
      .returns<PipelineStage[]>();

  if (pipelineStagesError) {
    throw new Error(pipelineStagesError.message);
  }

  return {
    branding: access.activeWorkspace.branding,
    canManageBranding: access.canManageBranding,
    canManageModules: access.canManageModules,
    canManagePipeline: access.canManagePipeline,
    canManageSettings: access.canManageSettings,
    canViewSettings: access.canViewSettings,
    currentUserRole: access.role,
    modules: access.activeWorkspace.modules,
    pipelineStages: pipelineStages ?? [],
    rolePermissions: access.rolePermissions,
    workspace: access.activeWorkspace.workspace,
  };
}
