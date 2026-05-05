import { ChevronDown } from "lucide-react";

export function WorkspaceSwitcher() {
  return (
    <button
      aria-label="Workspace switcher placeholder"
      className="mt-8 w-full rounded-xl border border-white/10 bg-[var(--ops-sidebar-card)] p-4 text-left transition hover:bg-[var(--ops-sidebar-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
      type="button"
    >
      <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
        Workspace
      </span>
      <span className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold text-[var(--ops-white)]">
        No workspace loaded
        <ChevronDown aria-hidden="true" className="h-4 w-4 text-white/55" />
      </span>
      <span className="mt-1 block text-xs leading-5 text-white/55">
        Connect workspace data later.
      </span>
    </button>
  );
}
