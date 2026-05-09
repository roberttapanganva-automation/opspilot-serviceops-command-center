import type { ReactNode } from "react";
import type { ActiveWorkspaceContext } from "@/types/domain";
import { AppShellChrome } from "./AppShellChrome";
import { Topbar } from "./Topbar";

type AppShellProps = {
  children: ReactNode;
  workspaceContext: ActiveWorkspaceContext;
};

export function AppShell({ children, workspaceContext }: AppShellProps) {
  return (
    <AppShellChrome
      topbar={<Topbar workspaceContext={workspaceContext} />}
      workspaceContext={workspaceContext}
    >
      {children}
    </AppShellChrome>
  );
}
