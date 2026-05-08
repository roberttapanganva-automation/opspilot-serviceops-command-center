import { SparkleIcon } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function AIAssistantCard() {
  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          description="Drafts, summaries, and suggested next actions will come later."
          title="AI Assistant"
        />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ops-primary)] text-white shadow-[0_12px_28px_var(--ops-primary-glow)]">
          <SparkleIcon aria-hidden="true" size={24} weight="duotone" />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4">
        <div className="h-3 w-5/6 rounded-full bg-[var(--ops-border)]" />
        <div className="mt-3 h-3 w-2/3 rounded-full bg-[var(--ops-border)]" />
        <div className="mt-4 inline-flex rounded-full bg-[var(--ops-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--ops-primary-dark)]">
          Coming later
        </div>
      </div>

      <div className="mt-5">
        <EmptyState
          description="AI actions are coming later. No OpenAI connection is active in this dashboard patch."
          title="AI is not connected"
        />
      </div>
    </Card>
  );
}
