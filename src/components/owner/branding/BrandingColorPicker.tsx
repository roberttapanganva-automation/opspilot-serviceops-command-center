"use client";

import { brandingColorPresets } from "@/lib/branding/colorPresets";

type BrandingColorPickerProps = {
  accentColor: string;
  disabled?: boolean;
  onAccentColorChange: (value: string) => void;
  onPrimaryColorChange: (value: string) => void;
  primaryColor: string;
};

function normalizeColorInput(value: string) {
  return value.trim().toUpperCase();
}

export function BrandingColorPicker({
  accentColor,
  disabled = false,
  onAccentColorChange,
  onPrimaryColorChange,
  primaryColor,
}: BrandingColorPickerProps) {
  const currentPreset =
    brandingColorPresets.find(
      (preset) =>
        preset.primary_color === primaryColor && preset.accent_color === accentColor,
    )?.label ?? "Custom";

  return (
    <div className="rounded-xl border border-[var(--ops-border)] bg-[var(--ops-card)] p-4">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr_1fr]">
        <div>
          <label
            className="text-sm font-medium text-[var(--ops-text)]"
            htmlFor="branding-color-preset"
          >
            Color preset
          </label>
          <select
            className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
            disabled={disabled}
            id="branding-color-preset"
            onChange={(event) => {
              const preset = brandingColorPresets.find(
                (item) => item.label === event.target.value,
              );

              if (!preset || preset.label === "Custom") {
                return;
              }

              onPrimaryColorChange(preset.primary_color);
              onAccentColorChange(preset.accent_color);
            }}
            value={currentPreset}
          >
            {brandingColorPresets.map((preset) => (
              <option key={preset.label} value={preset.label}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="text-sm font-medium text-[var(--ops-text)]"
            htmlFor="branding-primary-color"
          >
            Primary HEX
          </label>
          <div className="mt-2 flex h-10 items-center gap-2 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-3">
            <span
              aria-hidden="true"
              className="h-5 w-5 rounded-full border border-[var(--ops-border)]"
              style={{ backgroundColor: primaryColor }}
            />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--ops-text)] outline-none"
              disabled={disabled}
              id="branding-primary-color"
              name="primary_color"
              onChange={(event) =>
                onPrimaryColorChange(normalizeColorInput(event.target.value))
              }
              required
              value={primaryColor}
            />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-[var(--ops-text)]"
            htmlFor="branding-accent-color"
          >
            Accent HEX
          </label>
          <div className="mt-2 flex h-10 items-center gap-2 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-3">
            <span
              aria-hidden="true"
              className="h-5 w-5 rounded-full border border-[var(--ops-border)]"
              style={{ backgroundColor: accentColor }}
            />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--ops-text)] outline-none"
              disabled={disabled}
              id="branding-accent-color"
              name="accent_color"
              onChange={(event) =>
                onAccentColorChange(normalizeColorInput(event.target.value))
              }
              required
              value={accentColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
