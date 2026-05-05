"use client";

import { LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserMenuProps = {
  compact?: boolean;
};

export function UserMenu({ compact = false }: UserMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  if (compact) {
    return (
      <button
        aria-label="Sign out"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ops-sidebar)] text-sm font-semibold text-[var(--ops-white)] transition hover:bg-[var(--ops-sidebar-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)] disabled:opacity-50"
        disabled={isSigningOut}
        onClick={handleSignOut}
        type="button"
      >
        <UserRound aria-hidden="true" className="h-4 w-4" />
      </button>
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
          <UserRound aria-hidden="true" className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ops-white)]">
            Account
          </p>
          <p className="mt-0.5 text-xs text-white/55">Profile loads later.</p>
        </div>
      </div>

      <button
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-[var(--ops-white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)] disabled:opacity-50"
        disabled={isSigningOut}
        onClick={handleSignOut}
        type="button"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
