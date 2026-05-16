type BrandingDisplayInput = {
  branding: {
    app_name?: string | null;
    icon_url?: string | null;
    logo_url?: string | null;
  } | null;
  workspaceName?: string | null;
};

const DEFAULT_ICON_URL = "/opspilot-default-icon.svg";
const DEFAULT_LOGO_URL = "/opspilot-default-logo.svg";

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
  return branding?.icon_url || branding?.logo_url || DEFAULT_ICON_URL;
}

export function getWorkspaceLogoUrl({ branding }: BrandingDisplayInput) {
  return branding?.logo_url || DEFAULT_LOGO_URL;
}
