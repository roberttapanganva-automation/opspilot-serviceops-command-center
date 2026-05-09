"use client";

import { UserCircleIcon } from "@phosphor-icons/react";
type UserMenuProps = {
  compact?: boolean;
};

export function UserMenu({ compact = false }: UserMenuProps) {
  if (compact) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[var(--ops-sidebar-soft)] p-4">
      <div className="flex items-center gap-3">
        <div
          aria-label="User avatar placeholder"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ops-primary)] text-[var(--ops-white)]"
          role="img"
        >
          <UserCircleIcon aria-hidden="true" size={20} weight="duotone" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--ops-white)]">
              Account
            </p>
            <span
              aria-label="Active"
              className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30"
              title="Active"
            />
          </div>
          <p className="mt-0.5 text-xs text-white/55">Profile loads later.</p>
        </div>
      </div>
    </div>
  );
}
