"use client";

import { useEffect, useRef, useState } from "react";
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useThemePreference } from "@/components/theme/ThemeProvider";
import type { ApiResponse } from "@/types/api";
import type { ThemeMode, UserThemePreference } from "@/types/domain";

type ThemePreferenceUpdateResponse = UserThemePreference & {
  theme_mode: ThemeMode;
};

const options: Array<{
  label: string;
  value: ThemeMode;
}> = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

function ModeIcon({ mode, size = 20 }: { mode: ThemeMode; size?: number }) {
  if (mode === "light") {
    return <SunIcon aria-hidden="true" size={size} weight="regular" />;
  }

  if (mode === "dark") {
    return <MoonIcon aria-hidden="true" size={size} weight="regular" />;
  }

  return <DesktopIcon aria-hidden="true" size={size} weight="regular" />;
}

export function ThemeModeButton() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { setUserThemeMode, userThemeMode } = useThemePreference();
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function updateThemeMode(themeMode: ThemeMode) {
    const previousMode = userThemeMode;
    setError(null);
    setIsSaving(true);
    setUserThemeMode(themeMode);

    try {
      const response = await fetch("/api/me/theme", {
        body: JSON.stringify({ theme_mode: themeMode }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const result =
        (await response.json()) as ApiResponse<ThemePreferenceUpdateResponse>;

      if (!response.ok || !result.ok) {
        setUserThemeMode(previousMode);
        setError(result.ok ? "Theme update failed." : result.error.message);
        return;
      }

      setUserThemeMode(result.data.theme_mode);
      setIsOpen(false);
      router.refresh();
    } catch (caughtError) {
      setUserThemeMode(previousMode);
      setError(
        caughtError instanceof Error ? caughtError.message : "Theme update failed.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Change theme mode"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] text-[var(--ops-text-soft)] shadow-sm transition hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
        disabled={isSaving}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <ModeIcon mode={userThemeMode} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--ops-border)] bg-[var(--ops-card)] p-2 shadow-lg">
          {options.map(({ label, value }) => {
            const isSelected = value === userThemeMode;

            return (
              <button
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  isSelected
                    ? "bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]"
                    : "text-[var(--ops-text-soft)] hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)]"
                }`}
                disabled={isSaving}
                key={value}
                onClick={() => updateThemeMode(value)}
                type="button"
              >
                <ModeIcon mode={value} size={18} />
                {label}
              </button>
            );
          })}
          {error ? (
            <p className="mt-2 rounded-lg bg-[var(--ops-danger-soft)] p-2 text-xs text-[var(--ops-danger)]">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
