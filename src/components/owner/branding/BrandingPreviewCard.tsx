"use client";

type BrandingPreviewCardProps = {
  accentColor: string;
  appName: string;
  iconUrl: string | null;
  logoUrl: string | null;
  primaryColor: string;
};

export function BrandingPreviewCard({
  accentColor,
  appName,
  iconUrl,
  logoUrl,
  primaryColor,
}: BrandingPreviewCardProps) {
  return (
    <div className="rounded-xl border border-[var(--ops-border)] bg-[var(--ops-card)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
        Branding preview
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--ops-border)]">
        <div className="flex min-h-36">
          <aside
            className="hidden w-28 shrink-0 p-4 sm:block"
            style={{ backgroundColor: "#071327" }}
          >
            <div
              className="h-10 w-10 rounded-xl bg-cover bg-center"
              style={{
                backgroundColor: primaryColor,
                backgroundImage: iconUrl ? `url("${iconUrl}")` : undefined,
              }}
            />
            <div className="mt-5 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
            <div className="mt-3 h-2 rounded-full bg-white/20" />
            <div className="mt-3 h-2 rounded-full bg-white/20" />
          </aside>
          <section className="min-w-0 flex-1 bg-[var(--ops-card-soft)] p-4">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-20 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage: logoUrl ? `url("${logoUrl}")` : undefined,
                }}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--ops-text)]">
                  {appName || "OpsPilot"}
                </p>
                <p className="text-sm text-[var(--ops-text-soft)]">
                  Workspace command center
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] p-4">
              <div className="h-2 w-24 rounded-full" style={{ backgroundColor: accentColor }} />
              <div className="mt-4 h-8 w-32 rounded-lg" style={{ backgroundColor: primaryColor }} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
