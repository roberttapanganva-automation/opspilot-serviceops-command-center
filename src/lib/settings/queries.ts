import { getSettingsAccessContext } from "@/lib/settings/access";
import type {
  PipelineGroup,
  PipelineStage,
  WorkspaceMemberWithProfile,
  WorkspaceSettingsData,
} from "@/types/domain";

type MemberRow = {
  accepted_at: string | null;
  created_at: string;
  id: string;
  invited_email: string | null;
  role: WorkspaceMemberWithProfile["role"];
  status: WorkspaceMemberWithProfile["status"];
  user_id: string;
  workspace_id: string;
};

type ProfileRow = {
  avatar_url: string | null;
  full_name: string | null;
  id: string;
  last_seen_at: string | null;
};

async function getVisibleMembers(
  access: Extract<
    Awaited<ReturnType<typeof getSettingsAccessContext>>,
    { status: "ready" }
  >,
) {
  const workspaceId = access.activeWorkspace.workspace.id;
  const { data: members, error: membersError } = await access.supabase
    .from("workspace_members")
    .select("id,workspace_id,user_id,role,status,invited_email,accepted_at,created_at")
    .eq("workspace_id", workspaceId)
    .order("role", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<MemberRow[]>();

  if (membersError) {
    throw new Error(membersError.message);
  }

  const userIds = (members ?? [])
    .filter((member) => member.status === "active")
    .map((member) => member.user_id);
  const { data: profiles, error: profilesError } =
    userIds.length > 0
      ? await access.supabase
          .from("profiles")
          .select("id,full_name,avatar_url,last_seen_at")
          .in("id", userIds)
          .returns<ProfileRow[]>()
      : { data: [], error: null };

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return (members ?? []).map((member): WorkspaceMemberWithProfile => {
    const profile = profilesById.get(member.user_id);

    return {
      ...member,
      last_seen_at: profile?.last_seen_at ?? null,
      user: {
        avatar_url: profile?.avatar_url ?? null,
        email: member.invited_email,
        full_name: profile?.full_name ?? null,
        id: member.user_id,
      },
    };
  });
}

export async function getSettingsForActiveWorkspace(): Promise<WorkspaceSettingsData | null> {
  const access = await getSettingsAccessContext();

  if (access.status !== "ready") {
    return null;
  }

  const [
    { data: pipelineGroups, error: pipelineGroupsError },
    { data: pipelineStages, error: pipelineStagesError },
  ] = await Promise.all([
    access.supabase
      .from("pipeline_groups")
      .select(
        "id,workspace_id,name,description,entity_type,order_index,is_default,created_by,updated_by,created_at,updated_at",
      )
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .order("entity_type", { ascending: true })
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<PipelineGroup[]>(),
    access.supabase
      .from("pipeline_stages")
      .select(
        "id,workspace_id,pipeline_group_id,entity_type,name,color,order_index,is_closed,is_won,is_lost,created_at,updated_at",
      )
      .eq("workspace_id", access.activeWorkspace.workspace.id)
      .order("entity_type", { ascending: true })
      .order("order_index", { ascending: true })
      .returns<PipelineStage[]>(),
  ]);

  if (pipelineGroupsError || pipelineStagesError) {
    throw new Error(
      pipelineGroupsError?.message ?? pipelineStagesError?.message,
    );
  }

  const canViewMemberVisibility = ["owner", "admin", "manager"].includes(
    access.role,
  );
  const teamMembers = canViewMemberVisibility
    ? await getVisibleMembers(access)
    : [];

  return {
    branding: access.activeWorkspace.branding,
    canManageBranding: access.canManageBranding,
    canManageModules: access.canManageModules,
    canManagePipeline: access.canManagePipeline,
    canManageSettings: access.canManageSettings,
    canViewMemberVisibility,
    canViewSettings: access.canViewSettings,
    currentUserRole: access.role,
    modules: access.activeWorkspace.modules,
    pipelineGroups: pipelineGroups ?? [],
    pipelineStages: pipelineStages ?? [],
    rolePermissions: access.rolePermissions,
    teamMembers,
    workspace: access.activeWorkspace.workspace,
  };
}
