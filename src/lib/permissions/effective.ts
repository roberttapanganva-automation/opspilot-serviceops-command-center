import { getDefaultRolePermission } from "@/lib/permissions/workspace";
import type { createClient } from "@/lib/supabase/server";
import type { WorkspaceRole, WorkspaceRolePermission } from "@/types/domain";

export async function getEffectiveRolePermission({
  role,
  supabase,
  workspaceId,
}: {
  role: WorkspaceRole;
  supabase: Awaited<ReturnType<typeof createClient>>;
  workspaceId: string;
}) {
  if (role === "owner") {
    return null;
  }

  const { data } = await supabase
    .from("workspace_role_permissions")
    .select(
      "id,workspace_id,role,can_view_settings,can_edit_basic_settings,can_edit_branding,can_manage_modules,can_manage_pipeline,can_create_leads,can_create_jobs,can_create_tasks,can_create_appointments,can_view_audit_logs,created_at,updated_at",
    )
    .eq("workspace_id", workspaceId)
    .eq("role", role)
    .maybeSingle<WorkspaceRolePermission>();

  return data ?? getDefaultRolePermission(role);
}
