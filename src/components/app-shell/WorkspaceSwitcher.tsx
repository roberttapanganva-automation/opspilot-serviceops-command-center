import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import { getWorkspaceDisplayName } from "@/lib/branding/display";
import type { ActiveWorkspaceContext } from "@/types/domain";

type WorkspaceSwitcherProps = {
  workspaceContext: ActiveWorkspaceContext;
};

export function WorkspaceSwitcher({ workspaceContext }: WorkspaceSwitcherProps) {
  const workspaceName = workspaceContext.workspace.name;
  const appName = getWorkspaceDisplayName({
    branding: workspaceContext.branding,
    workspaceName,
  });

  return (
    <button
      aria-label="Workspace switcher placeholder"
      className="mt-5 w-full rounded-xl border border-white/10 bg-[var(--ops-sidebar-card)] px-3.5 py-2.5 text-left transition hover:bg-[var(--ops-sidebar-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
      type="button"
    >
      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
        Business
      </span>
      <span className="mt-1.5 flex items-center justify-between gap-3 text-sm font-semibold text-[var(--ops-white)]">
        <span className="truncate">{appName}</span>
        <CaretDownIcon
          aria-hidden="true"
          className="shrink-0 text-white/55"
          size={18}
          weight="regular"
        />
      </span>
      <span className="mt-1 block text-xs leading-5 text-white/55">
        {workspaceName}
      </span>
    </button>
  );
}
