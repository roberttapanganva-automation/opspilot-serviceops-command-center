import type { ReactNode } from "react";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--ops-main-bg)] text-[var(--ops-text)]">
      <div className="min-h-screen lg:pl-[260px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
          <Topbar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
