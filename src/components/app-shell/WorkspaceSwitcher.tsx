import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import type { ActiveWorkspaceContext } from "@/types/domain";

type WorkspaceSwitcherProps = {
  workspaceContext: ActiveWorkspaceContext;
};

export function WorkspaceSwitcher({ workspaceContext }: WorkspaceSwitcherProps) {
  const workspaceName = workspaceContext.workspace.name;
  const roleLabel =
    workspaceContext.role.charAt(0).toUpperCase() + workspaceContext.role.slice(1);

  return (
    <button
      aria-label="Workspace switcher placeholder"
      className="mt-7 w-full rounded-xl border border-white/10 bg-[var(--ops-sidebar-card)] px-4 py-3 text-left transition hover:bg-[var(--ops-sidebar-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
      type="button"
    >
      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
        Workspace
      </span>
      <span className="mt-1.5 flex items-center justify-between gap-3 text-sm font-semibold text-[var(--ops-white)]">
        <span className="truncate">{workspaceName}</span>
        <CaretDownIcon
          aria-hidden="true"
          className="shrink-0 text-white/55"
          size={20}
          weight="regular"
        />
      </span>
      <span className="mt-1 block text-xs leading-5 text-white/55">
        {roleLabel}
      </span>
    </button>
  );
}
