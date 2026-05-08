"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ThemeMode, UserThemePreference } from "@/types/domain";

type ThemeContextValue = UserThemePreference & {
  setUserThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(mode: ThemeMode) {
  if (mode !== "system") {
    return mode;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  initialPreference,
}: {
  children: ReactNode;
  initialPreference: UserThemePreference;
}) {
  const [userThemeMode, setUserThemeMode] = useState<ThemeMode>(
    initialPreference.userThemeMode,
  );
  const workspaceDefaultThemeMode = initialPreference.workspaceDefaultThemeMode;
  const effectiveThemeMode =
    userThemeMode === "system" ? workspaceDefaultThemeMode : userThemeMode;

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme() {
      root.dataset.theme = resolveTheme(effectiveThemeMode);
      root.dataset.themePreference = userThemeMode;
    }

    applyTheme();

    if (effectiveThemeMode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);

    return () => media.removeEventListener("change", applyTheme);
  }, [effectiveThemeMode, userThemeMode]);

  const value = useMemo(
    () => ({
      effectiveThemeMode,
      setUserThemeMode,
      userThemeMode,
      workspaceDefaultThemeMode,
    }),
    [effectiveThemeMode, userThemeMode, workspaceDefaultThemeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemePreference must be used inside ThemeProvider.");
  }

  return context;
}
