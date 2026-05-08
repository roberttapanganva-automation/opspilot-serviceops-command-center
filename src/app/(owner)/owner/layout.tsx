import type { ReactNode } from "react";
import { OwnerConsoleShell } from "@/components/owner/OwnerConsoleShell";
import { OwnerRestrictedState } from "@/components/owner/OwnerRestrictedState";
import { updateCurrentUserLastSeen } from "@/lib/auth/lastSeen";
import { getOwnerAccessContext } from "@/lib/owner/access";

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

  return (
    <OwnerConsoleShell workspaceContext={access.activeWorkspace}>
      {children}
    </OwnerConsoleShell>
  );
}
