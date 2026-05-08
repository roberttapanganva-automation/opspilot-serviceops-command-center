import type { ReactNode } from "react";
import type { ActiveWorkspaceContext } from "@/types/domain";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  children: ReactNode;
  workspaceContext: ActiveWorkspaceContext;
};

export function AppShell({ children, workspaceContext }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--ops-main-bg)] text-[var(--ops-text)]">
      <div className="min-h-screen lg:pl-[260px]">
        <Sidebar workspaceContext={workspaceContext} />
        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
          <Topbar workspaceContext={workspaceContext} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
      <MobileNav workspaceContext={workspaceContext} />
    </div>
  );
}
