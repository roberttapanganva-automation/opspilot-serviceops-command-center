export type WorkspaceStatus = "active" | "trial" | "suspended";

export type WorkspaceRole = "owner" | "admin" | "manager" | "staff" | "viewer";

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
  theme_mode: "system" | "light" | "dark";
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

export type ActiveWorkspaceContext = {
  branding: WorkspaceBranding | null;
  modules: WorkspaceModules | null;
  workspace: Workspace;
};
