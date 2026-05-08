"use client";

import { UserCircleIcon } from "@phosphor-icons/react";
import { SignOutButton } from "./SignOutButton";

type UserMenuProps = {
  compact?: boolean;
};

export function UserMenu({ compact = false }: UserMenuProps) {
  if (compact) {
    return (
      <SignOutButton
        className="bg-[var(--ops-sidebar)] text-sm font-semibold text-[var(--ops-white)] hover:bg-[var(--ops-sidebar-soft)]"
        compact
      />
    );
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
          <p className="text-sm font-semibold text-[var(--ops-white)]">
            Account
          </p>
          <p className="mt-0.5 text-xs text-white/55">Profile loads later.</p>
        </div>
      </div>

      <SignOutButton
        className="mt-4 w-full border border-white/10 text-white/80 hover:bg-white/10 hover:text-[var(--ops-white)]"
      />
    </div>
  );
}
