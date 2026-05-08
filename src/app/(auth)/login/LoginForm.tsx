"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  EnvelopeSimpleIcon,
  LockIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  envError?: string;
};

function getHumanError(message: string) {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "The email or password is not correct.";
  }

  return message;
}

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export function LoginForm({ envError }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(envError ?? null);
  const [isLoading, setIsLoading] = useState(false);

  const nextPath = useMemo(() => {
    return getSafeRedirectPath(
      searchParams.get("redirect") ?? searchParams.get("next"),
    );
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(getHumanError(signInError.message));
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not sign you in. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {error ? (
        <div
          className="flex gap-3 rounded-lg border border-[var(--ops-danger-soft)] bg-[var(--ops-danger-soft)] p-3 text-sm leading-6 text-[var(--ops-danger)]"
          role="alert"
        >
          <WarningCircleIcon
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={20}
            weight="regular"
          />
          <p>{error}</p>
        </div>
      ) : null}

      <div>
        <label
          className="text-sm font-medium text-[var(--ops-text)]"
          htmlFor="email"
        >
          Email
        </label>
        <Input
          autoComplete="email"
          className="mt-2 sm:w-full"
          id="email"
          icon={
            <EnvelopeSimpleIcon
              aria-hidden="true"
              size={20}
              weight="regular"
            />
          }
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-sm font-medium text-[var(--ops-text)]"
            htmlFor="password"
          >
            Password
          </label>
          <Link
            className="text-sm font-semibold text-[var(--ops-primary-dark)] hover:text-[var(--ops-primary)]"
            href="/reset-password"
          >
            Reset password
          </Link>
        </div>
        <Input
          autoComplete="current-password"
          className="mt-2 sm:w-full"
          id="password"
          icon={<LockIcon aria-hidden="true" size={20} weight="regular" />}
          label="Password"
          name="password"
          placeholder="Password"
          required
          type="password"
        />
      </div>

      <Button className="w-full" disabled={isLoading} type="submit">
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
