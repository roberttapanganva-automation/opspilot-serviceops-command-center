import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { NoWorkspaceState } from "@/components/app-shell/NoWorkspaceState";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { updateCurrentUserLastSeen } from "@/lib/auth/lastSeen";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import { getThemePreference } from "@/lib/theme/getThemePreference";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return <NoWorkspaceState error={activeWorkspace.error} />;
  }

  await updateCurrentUserLastSeen();
  const themePreference = await getThemePreference(activeWorkspace.context);

  return (
    <ThemeProvider initialPreference={themePreference}>
      <AppShell workspaceContext={activeWorkspace.context}>{children}</AppShell>
    </ThemeProvider>
  );
}
