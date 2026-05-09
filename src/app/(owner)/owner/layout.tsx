import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { OwnerConsoleShell } from "@/components/owner/OwnerConsoleShell";
import { OwnerRestrictedState } from "@/components/owner/OwnerRestrictedState";
import { updateCurrentUserLastSeen } from "@/lib/auth/lastSeen";
import { getOwnerAccessContext } from "@/lib/owner/access";
import { getThemePreference } from "@/lib/theme/getThemePreference";

export default async function OwnerLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const access = await getOwnerAccessContext();

  if (access.status !== "ready") {
    return <OwnerRestrictedState />;
  }

  await updateCurrentUserLastSeen();
  const themePreference = await getThemePreference(access.activeWorkspace);

  return (
    <ThemeProvider initialPreference={themePreference}>
      <OwnerConsoleShell workspaceContext={access.activeWorkspace}>
        {children}
      </OwnerConsoleShell>
    </ThemeProvider>
  );
}
