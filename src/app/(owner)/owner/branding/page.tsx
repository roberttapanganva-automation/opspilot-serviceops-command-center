import { OwnerBrandingForm } from "@/components/owner/branding/OwnerBrandingForm";
import { getOwnerWorkspaceSettings } from "@/lib/owner/queries";

export default async function OwnerBrandingPage() {
  const settings = await getOwnerWorkspaceSettings();

  if (!settings) {
    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-[var(--ops-text)]">
          Branding
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
          Owner-managed workspace identity, logo assets, color tokens, and the
          workspace default theme. Workspace default theme affects users who
          choose System/default behavior. Each user can still choose their own
          theme from the dashboard.
        </p>
      </section>
      <OwnerBrandingForm branding={settings.branding} />
    </div>
  );
}
