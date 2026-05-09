import Link from "next/link";
import { BrandingForm } from "@/components/settings/BrandingForm";
import { ModulesForm } from "@/components/settings/ModulesForm";
import { RestrictedSettingsState } from "@/components/settings/RestrictedSettingsState";
import { SecuritySettingsPlaceholder } from "@/components/settings/SecuritySettingsPlaceholder";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { TeamSettingsPlaceholder } from "@/components/settings/TeamSettingsPlaceholder";
import { TeamVisibility } from "@/components/settings/TeamVisibility";
import { WorkspaceProfileForm } from "@/components/settings/WorkspaceProfileForm";
import { Card } from "@/components/ui/Card";
import { getSettingsForActiveWorkspace } from "@/lib/settings/queries";

export default async function SettingsPage() {
  const settings = await getSettingsForActiveWorkspace();

  if (!settings) {
    return (
      <Card className="p-6">
        <h1 className="text-lg font-semibold text-[var(--ops-text)]">
          Settings unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ops-text-soft)]">
          We could not load settings for the active workspace.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <SettingsPageHeader
        canManageSettings={settings.canManageSettings}
        role={settings.currentUserRole}
      />

      {settings.currentUserRole === "owner" ? (
        <>
          <section className="grid gap-5 xl:grid-cols-2">
            <WorkspaceProfileForm
              canManageSettings={settings.canManageSettings}
              workspace={settings.workspace}
            />
            <BrandingForm
              branding={settings.branding}
              canManageSettings={settings.canManageBranding}
            />
          </section>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[var(--ops-text)]">
              Full workspace controls are available in Owner Console.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ops-text-soft)]">
              Use Owner Console for team roles, invitations, modules, pipeline,
              access rules, audit logs, and ownership placeholders.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--ops-primary)] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_var(--ops-primary-glow)] transition hover:bg-[var(--ops-primary-dark)]"
                href="/owner/branding"
              >
                Open Owner Branding
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--ops-border-strong)] bg-white px-4 text-sm font-semibold text-[var(--ops-text)] transition hover:bg-[var(--ops-card-soft)]"
                href="/owner"
              >
                Open Owner Console
              </Link>
            </div>
          </Card>
        </>
      ) : !settings.canViewSettings ? (
        <RestrictedSettingsState />
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-2">
            <WorkspaceProfileForm
              canManageSettings={settings.canManageSettings}
              workspace={settings.workspace}
            />
            <BrandingForm
              branding={settings.branding}
              canManageSettings={settings.canManageBranding}
            />
          </section>

          <ModulesForm
            canManageSettings={settings.canManageModules}
            modules={settings.modules}
          />

          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--ops-text)]">
              Pipelines
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ops-text-soft)]">
              Pipeline structure is owner-managed in Owner Console. Open the
              Pipelines page to view the board and move cards through active
              workflows.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--ops-primary)] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_var(--ops-primary-glow)] transition hover:bg-[var(--ops-primary-dark)]"
                href="/pipelines"
              >
                Open Pipelines
              </Link>
            </div>
          </Card>

          {settings.canViewMemberVisibility ? (
            <TeamVisibility members={settings.teamMembers} />
          ) : null}

          <section className="grid gap-5 lg:grid-cols-2">
            {settings.canViewMemberVisibility ? null : <TeamSettingsPlaceholder />}
            <SecuritySettingsPlaceholder />
          </section>
        </>
      )}
    </div>
  );
}
