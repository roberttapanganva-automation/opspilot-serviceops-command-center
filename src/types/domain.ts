export type WorkspaceStatus = "active" | "trial" | "suspended";

export type ThemeMode = "system" | "light" | "dark";

export type WorkspaceRole = "owner" | "admin" | "manager" | "staff" | "viewer";

export type AssignableWorkspaceRole = Exclude<WorkspaceRole, "owner">;

export type MemberActivityStatus = "online" | "recently_active" | "offline";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  owner_id: string;
  status: WorkspaceStatus;
  currency_code: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceBranding = {
  workspace_id: string;
  app_name: string;
  logo_url: string | null;
  icon_url: string | null;
  primary_color: string;
  accent_color: string;
  login_heading: string | null;
  login_subtext: string | null;
  theme_mode: ThemeMode;
  created_at: string;
  updated_at: string;
};

export type WorkspaceModules = {
  workspace_id: string;
  leads_enabled: boolean;
  jobs_enabled: boolean;
  tasks_enabled: boolean;
  calendar_enabled: boolean;
  reports_enabled: boolean;
  automations_enabled: boolean;
  ai_enabled: boolean;
  invoices_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkspaceBrandingSettings = WorkspaceBranding;

export type BrandingColorPreset = {
  accent_color: string;
  label: string;
  primary_color: string;
};

export type UserThemePreference = {
  effectiveThemeMode: ThemeMode;
  userThemeMode: ThemeMode;
  workspaceDefaultThemeMode: ThemeMode;
};

export type WorkspaceModuleSettings = WorkspaceModules;

export type PipelineStage = {
  color: string;
  created_at: string;
  entity_type: "lead" | "job";
  id: string;
  is_closed: boolean;
  is_lost: boolean;
  is_won: boolean;
  name: string;
  order_index: number;
  updated_at: string;
  workspace_id: string;
};

export type WorkspaceSettingsData = {
  branding: WorkspaceBrandingSettings | null;
  canManageSettings: boolean;
  canManageBranding: boolean;
  canManageModules: boolean;
  canManagePipeline: boolean;
  canViewSettings: boolean;
  currentUserRole: WorkspaceRole;
  modules: WorkspaceModuleSettings | null;
  pipelineStages: PipelineStage[];
  rolePermissions: WorkspaceRolePermission | null;
  workspace: Workspace;
};

export type ActiveWorkspaceContext = {
  branding: WorkspaceBranding | null;
  modules: WorkspaceModules | null;
  role: WorkspaceRole;
  rolePermissions: WorkspaceRolePermission | null;
  workspace: Workspace;
};

export type WorkspaceInvitation = {
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  expires_at: string | null;
  id: string;
  invited_by: string | null;
  invited_email: string;
  role: AssignableWorkspaceRole;
  status: "pending" | "accepted" | "cancelled" | "expired";
  updated_at: string;
  workspace_id: string;
};

export type InviteAcceptanceDisplay = Pick<
  WorkspaceInvitation,
  "expires_at" | "id" | "invited_email" | "role" | "status"
> & {
  workspaceName: string | null;
};

export type InviteAcceptanceState =
  | {
      invitationId: string;
      invitation?: undefined;
      message: string;
      status: "unauthenticated" | "invalid" | "email_mismatch";
    }
  | {
      invitation: InviteAcceptanceDisplay;
      invitationId: string;
      message: string;
      status: "pending" | "accepted" | "cancelled" | "expired";
    };

export type InviteAcceptanceResult = {
  invitationId: string;
  role: AssignableWorkspaceRole;
  status: "accepted";
  workspaceId: string;
};

export type WorkspaceRolePermission = {
  can_create_appointments: boolean;
  can_create_jobs: boolean;
  can_create_leads: boolean;
  can_create_tasks: boolean;
  can_edit_basic_settings: boolean;
  can_edit_branding: boolean;
  can_manage_modules: boolean;
  can_manage_pipeline: boolean;
  can_view_audit_logs: boolean;
  can_view_settings: boolean;
  created_at: string;
  id: string;
  role: AssignableWorkspaceRole;
  updated_at: string;
  workspace_id: string;
};

export type WorkspaceMemberWithProfile = {
  accepted_at: string | null;
  created_at: string;
  id: string;
  invited_email: string | null;
  last_seen_at: string | null;
  role: WorkspaceRole;
  status: "active" | "invited" | "disabled";
  user: {
    avatar_url: string | null;
    email: string | null;
    full_name: string | null;
    id: string;
  };
  user_id: string;
  workspace_id: string;
};

export type OwnerAuditLog = {
  action: string;
  actor_user_id: string | null;
  created_at: string;
  entity_id: string | null;
  entity_type: string;
  id: string;
  metadata: Record<string, unknown> | null;
  workspace_id: string;
};

export type OwnerConsoleOverview = {
  auditLogCount: number;
  brandingConfigured: boolean;
  enabledModuleCount: number;
  latestAuditLogs: OwnerAuditLog[];
  memberCount: number;
  pendingInvitationCount: number;
  rolePermissionCount: number;
  workspace: Workspace;
};

export type DashboardKpis = {
  currencyCode: string;
  estimatedRevenueThisMonth: number;
  jobsBookedThisMonth: number;
  newLeadsThisMonth: number;
  overdueTasks: number;
};

export type DashboardAgendaItem = {
  ends_at: string | null;
  id: string;
  location: string | null;
  starts_at: string;
  status: string;
  title: string;
  type: "appointment" | "job";
};

export type DashboardTaskItem = {
  created_at: string;
  due_at: string | null;
  id: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "todo" | "in_progress" | "done" | "cancelled";
  title: string;
};

export type DashboardTaskSummary = {
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  recentTasks: DashboardTaskItem[];
  totalTasks: number;
};

export type DashboardPipelineStageSummary = {
  color: string;
  count: number;
  entity_type: "lead" | "job";
  id: string;
  name: string;
  order_index: number;
};

export type DashboardRevenueSummary = {
  completedActualRevenue: number;
  currencyCode: string;
  estimatedRevenueAllOpenJobs: number;
  estimatedRevenueScheduledJobs: number;
  estimatedRevenueThisMonth: number;
  jobCount: number;
};

export type DashboardActivityItem = {
  created_at: string;
  id: string;
  message: string;
  status: string | null;
  title: string;
  type: "automation" | "audit";
};

export type DashboardOverview = {
  agendaItems: DashboardAgendaItem[];
  kpis: DashboardKpis;
  pipeline: {
    jobStages: DashboardPipelineStageSummary[];
    leadStages: DashboardPipelineStageSummary[];
  };
  recentActivity: DashboardActivityItem[];
  revenue: DashboardRevenueSummary;
  taskSummary: DashboardTaskSummary;
  workspace: {
    currencyCode: string;
    id: string;
    name: string;
  };
};
