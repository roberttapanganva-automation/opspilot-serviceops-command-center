import { WarningCircleIcon } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/Card";

const items = [
  "Transfer ownership - coming later",
  "Export workspace data - coming later",
  "Delete workspace - coming later",
];

export function DangerZonePlaceholder() {
  return (
    <Card className="border-[var(--ops-danger-soft)] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ops-danger-soft)] text-[var(--ops-danger)]">
          <WarningCircleIcon aria-hidden="true" size={22} weight="duotone" />
        </div>
        <div>
          <h2 className="font-semibold text-[var(--ops-text)]">Danger Zone</h2>
          <p className="text-sm text-[var(--ops-text-soft)]">
            Destructive owner actions are placeholders only in this patch.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            className="rounded-lg border border-dashed border-[var(--ops-border-strong)] bg-[var(--ops-card-soft)] p-4 text-sm font-semibold text-[var(--ops-text-soft)]"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
    </Card>
  );
}
