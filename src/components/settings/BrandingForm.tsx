"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ApiResponse } from "@/types/api";
import type { WorkspaceBrandingSettings } from "@/types/domain";

type BrandingFormProps = {
  branding: WorkspaceBrandingSettings | null;
  canManageSettings: boolean;
};

type BrandingResponse = Record<string, unknown>;

function getErrorMessage(response: ApiResponse<BrandingResponse>) {
  return response.ok ? null : response.error.message;
}

export function BrandingForm({
  branding,
  canManageSettings,
}: BrandingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(
    branding?.primary_color ?? "#6D5DFC",
  );
  const [accentColor, setAccentColor] = useState(
    branding?.accent_color ?? "#4F46E5",
  );
  const [appName, setAppName] = useState(branding?.app_name ?? "OpsPilot");
  const disabled = !canManageSettings || isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      accent_color: String(formData.get("accent_color") ?? ""),
      app_name: String(formData.get("app_name") ?? ""),
      icon_url: String(formData.get("icon_url") ?? ""),
      login_heading: String(formData.get("login_heading") ?? ""),
      login_subtext: String(formData.get("login_subtext") ?? ""),
      logo_url: String(formData.get("logo_url") ?? ""),
      primary_color: String(formData.get("primary_color") ?? ""),
      theme_mode: String(formData.get("theme_mode") ?? "system"),
    };

    try {
      const response = await fetch("/api/settings/branding", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const result = (await response.json()) as ApiResponse<BrandingResponse>;
      const message = getErrorMessage(result);

      if (!response.ok || message) {
        setError(message ?? "We could not update workspace branding.");
        return;
      }

      setSuccess("Workspace branding updated.");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not update workspace branding.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-[var(--ops-text)]">
          Branding
        </h2>
        <p className="text-sm text-[var(--ops-text-soft)]">
          Set workspace display text and color tokens. Owners can manage logo
          uploads from Owner Console.
        </p>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p
            className="rounded-lg bg-[var(--ops-danger-soft)] p-3 text-sm text-[var(--ops-danger)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg bg-[var(--ops-success-soft)] p-3 text-sm text-[var(--ops-success)]">
            {success}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-[var(--ops-text)]"
              htmlFor="settings-app-name"
            >
              App name
            </label>
            <input
              className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
              defaultValue={branding?.app_name ?? "OpsPilot"}
              disabled={disabled}
              id="settings-app-name"
              name="app_name"
              onChange={(event) => setAppName(event.target.value)}
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--ops-text)]"
              htmlFor="settings-theme-mode"
            >
              Theme mode
            </label>
            <select
              className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
              defaultValue={branding?.theme_mode ?? "system"}
              disabled={disabled}
              id="settings-theme-mode"
              name="theme_mode"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--ops-text)]"
              htmlFor="settings-primary-color"
            >
              Primary color
            </label>
            <input
              className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
              defaultValue={primaryColor}
              disabled={disabled}
              id="settings-primary-color"
              name="primary_color"
              onChange={(event) => setPrimaryColor(event.target.value)}
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--ops-text)]"
              htmlFor="settings-accent-color"
            >
              Accent color
            </label>
            <input
              className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
              defaultValue={accentColor}
              disabled={disabled}
              id="settings-accent-color"
              name="accent_color"
              onChange={(event) => setAccentColor(event.target.value)}
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--ops-text)]"
              htmlFor="settings-logo-url"
            >
              Logo URL
            </label>
            <input
              className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
              defaultValue={branding?.logo_url ?? ""}
              disabled={disabled}
              id="settings-logo-url"
              name="logo_url"
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--ops-text)]"
              htmlFor="settings-icon-url"
            >
              Icon URL
            </label>
            <input
              className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
              defaultValue={branding?.icon_url ?? ""}
              disabled={disabled}
              id="settings-icon-url"
              name="icon_url"
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--ops-text)]"
              htmlFor="settings-login-heading"
            >
              Login heading
            </label>
            <input
              className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
              defaultValue={branding?.login_heading ?? ""}
              disabled={disabled}
              id="settings-login-heading"
              name="login_heading"
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--ops-text)]"
              htmlFor="settings-login-subtext"
            >
              Login subtext
            </label>
            <input
              className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
              defaultValue={branding?.login_subtext ?? ""}
              disabled={disabled}
              id="settings-login-subtext"
              name="login_subtext"
              type="text"
            />
          </div>
        </div>

        <div className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4">
          <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
            Preview
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg"
              style={{ backgroundColor: primaryColor }}
            />
            <div>
              <p className="font-semibold text-[var(--ops-text)]">{appName}</p>
              <p className="text-sm text-[var(--ops-text-soft)]">
                Accent {accentColor}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button disabled={disabled} type="submit">
            {isSubmitting ? "Saving..." : "Save branding"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
