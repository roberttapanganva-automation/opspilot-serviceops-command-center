"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

type ResetPasswordFormProps = {
  envError?: string;
};

export function ResetPasswordForm({ envError }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(envError ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : undefined;

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not send a reset email. Please try again.",
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

      {success ? (
        <div
          className="flex gap-3 rounded-lg border border-[var(--ops-success-soft)] bg-[var(--ops-success-soft)] p-3 text-sm leading-6 text-[var(--ops-success)]"
          role="status"
        >
          <CheckCircleIcon
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={20}
            weight="regular"
          />
          <p>If that email exists, Supabase will send reset instructions.</p>
        </div>
      ) : null}

      <div>
        <label
          className="text-sm font-medium text-[var(--ops-text)]"
          htmlFor="reset-email"
        >
          Email
        </label>
        <Input
          autoComplete="email"
          className="mt-2 sm:w-full"
          id="reset-email"
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

      <Button className="w-full" disabled={isLoading} type="submit">
        {isLoading ? "Sending..." : "Send reset email"}
      </Button>

      <Link
        className="block text-center text-sm font-semibold text-[var(--ops-primary-dark)] hover:text-[var(--ops-primary)]"
        href="/login"
      >
        Back to sign in
      </Link>
    </form>
  );
}
