import {
  BellIcon,
  ChatCircleTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeModeButton } from "@/components/theme/ThemeModeButton";
import { canCreateOperationalRecords } from "@/lib/permissions/workspace";
import type { ActiveWorkspaceContext } from "@/types/domain";
import { UserMenu } from "./UserMenu";

type TopbarProps = {
  workspaceContext: ActiveWorkspaceContext;
};

export function Topbar({ workspaceContext }: TopbarProps) {
  const appName = workspaceContext.branding?.app_name ?? "OpsPilot";
  const workspaceName = workspaceContext.workspace.name;
  const rolePermissions = workspaceContext.rolePermissions;
  const canCreateRecords =
    canCreateOperationalRecords(workspaceContext.role) &&
    (workspaceContext.role === "owner" ||
      rolePermissions?.can_create_leads === true ||
      rolePermissions?.can_create_jobs === true ||
      rolePermissions?.can_create_tasks === true ||
      rolePermissions?.can_create_appointments === true);

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--ops-border)] bg-[var(--ops-main-bg)]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ops-text-muted)]">
            {appName}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-text)]">
            {workspaceName}
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            id="global-search"
            icon={
              <MagnifyingGlassIcon
                aria-hidden="true"
                size={20}
                weight="regular"
              />
            }
            label="Search anything"
            placeholder="Search anything..."
            type="search"
          />
          {canCreateRecords ? (
            <Button className="gap-2">
              <PlusIcon aria-hidden="true" size={20} weight="regular" />
              Add New
            </Button>
          ) : null}
          <div className="flex items-center gap-2" aria-label="Account tools">
            <button
              aria-label="Messages"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white text-[var(--ops-text-soft)] shadow-sm transition hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
              type="button"
            >
              <ChatCircleTextIcon
                aria-hidden="true"
                size={20}
                weight="regular"
              />
            </button>
            <button
              aria-label="Notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white text-[var(--ops-text-soft)] shadow-sm transition hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
              type="button"
            >
              <BellIcon aria-hidden="true" size={20} weight="regular" />
            </button>
            <ThemeModeButton />
            <div className="hidden sm:block">
              <UserMenu compact />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
