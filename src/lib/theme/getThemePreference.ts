import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import type {
  ActiveWorkspaceContext,
  ThemeMode,
  UserThemePreference,
} from "@/types/domain";

type ThemeProfileRow = {
  theme_mode: ThemeMode | null;
};

export async function getThemePreference(
  activeWorkspaceContext?: ActiveWorkspaceContext,
): Promise<UserThemePreference> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userThemeMode: ThemeMode = "system";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("theme_mode")
      .eq("id", user.id)
      .maybeSingle<ThemeProfileRow>();

    userThemeMode = profile?.theme_mode ?? "system";
  }

  let workspaceDefaultThemeMode: ThemeMode =
    activeWorkspaceContext?.branding?.theme_mode ?? "system";

  if (!activeWorkspaceContext) {
    const activeWorkspace = await getActiveWorkspace();
    workspaceDefaultThemeMode =
      activeWorkspace.status === "ready"
        ? activeWorkspace.context.branding?.theme_mode ?? "system"
        : "system";
  }

  return {
    effectiveThemeMode:
      userThemeMode === "system" ? workspaceDefaultThemeMode : userThemeMode,
    userThemeMode,
    workspaceDefaultThemeMode,
  };
}
