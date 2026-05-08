import { PipelineSettings } from "@/components/settings/PipelineSettings";
import { getOwnerWorkspaceSettings } from "@/lib/owner/queries";

export default async function OwnerPipelinePage() {
  const settings = await getOwnerWorkspaceSettings();

  if (!settings) {
    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-[var(--ops-text)]">
          Pipeline
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
          Owner-managed lead and job stages.
        </p>
      </section>
      <PipelineSettings canManageSettings stages={settings.pipelineStages} />
    </div>
  );
}
