"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type SignOutButtonProps = {
  className?: string;
  compact?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export function SignOutButton({
  className = "",
  compact = false,
  variant = "ghost",
}: SignOutButtonProps) {
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
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)] disabled:opacity-50 ${className}`}
        disabled={isSigningOut}
        onClick={handleSignOut}
        type="button"
      >
        <SignOutIcon aria-hidden="true" size={20} weight="regular" />
      </button>
    );
  }

  return (
    <Button
      className={`gap-2 ${className}`}
      disabled={isSigningOut}
      onClick={handleSignOut}
      type="button"
      variant={variant}
    >
      <SignOutIcon aria-hidden="true" size={20} weight="regular" />
      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
