type BrandingDisplayInput = {
  branding: {
    app_name?: string | null;
    icon_url?: string | null;
    logo_url?: string | null;
  } | null;
  workspaceName?: string | null;
};

export function getWorkspaceDisplayName({
  branding,
  workspaceName,
}: BrandingDisplayInput) {
  const appName = branding?.app_name?.trim();
  if (appName) {
    return appName;
  }

  const fallbackWorkspace = workspaceName?.trim();
  if (fallbackWorkspace) {
    return fallbackWorkspace;
  }

  return "OpsPilot";
}

export function getWorkspaceIconUrl({ branding }: BrandingDisplayInput) {
  return branding?.icon_url || branding?.logo_url || null;
}

export function getWorkspaceLogoUrl({ branding }: BrandingDisplayInput) {
  return branding?.logo_url || null;
}
