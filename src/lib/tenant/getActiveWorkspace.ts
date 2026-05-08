import { createClient } from "@/lib/supabase/server";
import type {
  ActiveWorkspaceContext,
  Workspace,
  WorkspaceBranding,
  WorkspaceModules,
  WorkspaceRolePermission,
  WorkspaceRole,
} from "@/types/domain";
import { getDefaultRolePermission } from "@/lib/permissions/workspace";

type WorkspaceMemberRow = {
  role: WorkspaceRole;
  workspace_id: string;
};

type ActiveWorkspaceResult =
  | {
      context: ActiveWorkspaceContext;
      error?: never;
      status: "ready";
    }
  | {
      context: null;
      error?: string;
      status: "no-user" | "no-workspace" | "error";
    };

export async function getActiveWorkspace(): Promise<ActiveWorkspaceResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      context: null,
      error: userError.message,
      status: "error",
    };
  }

  if (!user) {
    return {
      context: null,
      status: "no-user",
    };
  }

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("workspace_id,role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<WorkspaceMemberRow>();

  if (memberError) {
    return {
      context: null,
      error: memberError.message,
      status: "error",
    };
  }

  if (!member) {
    return {
      context: null,
      status: "no-workspace",
    };
  }

  const workspaceId = member.workspace_id;

  const [
    { data: workspace, error: workspaceError },
    { data: branding, error: brandingError },
    { data: modules, error: modulesError },
    { data: rolePermissions, error: rolePermissionsError },
  ] = await Promise.all([
    supabase
      .from("workspaces")
      .select(
        "id,name,slug,industry,owner_id,status,currency_code,timezone,created_at,updated_at",
      )
      .eq("id", workspaceId)
      .maybeSingle<Workspace>(),
    supabase
      .from("workspace_branding")
      .select(
        "workspace_id,app_name,logo_url,icon_url,primary_color,accent_color,login_heading,login_subtext,theme_mode,created_at,updated_at",
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle<WorkspaceBranding>(),
    supabase
      .from("workspace_modules")
      .select(
        "workspace_id,leads_enabled,jobs_enabled,tasks_enabled,calendar_enabled,reports_enabled,automations_enabled,ai_enabled,invoices_enabled,created_at,updated_at",
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle<WorkspaceModules>(),
    member.role === "owner"
      ? Promise.resolve({ data: null, error: null })
      : supabase
          .from("workspace_role_permissions")
          .select(
            "id,workspace_id,role,can_view_settings,can_edit_basic_settings,can_edit_branding,can_manage_modules,can_manage_pipeline,can_create_leads,can_create_jobs,can_create_tasks,can_create_appointments,can_view_audit_logs,created_at,updated_at",
          )
          .eq("workspace_id", workspaceId)
          .eq("role", member.role)
          .maybeSingle<WorkspaceRolePermission>(),
  ]);

  if (workspaceError || brandingError || modulesError || rolePermissionsError) {
    return {
      context: null,
      error:
        workspaceError?.message ??
        brandingError?.message ??
        modulesError?.message ??
        rolePermissionsError?.message,
      status: "error",
    };
  }

  if (!workspace) {
    return {
      context: null,
      status: "no-workspace",
    };
  }

  return {
    context: {
      branding,
      modules,
      role: member.role,
      rolePermissions: rolePermissions ?? getDefaultRolePermission(member.role),
      workspace,
    },
    status: "ready",
  };
}
