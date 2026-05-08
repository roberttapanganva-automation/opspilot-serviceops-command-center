import { LockKeyIcon } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/Card";

export function SecuritySettingsPlaceholder() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--ops-text)]">
            Security
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--ops-text-soft)]">
            Security controls, audit exports, and advanced access settings will
            be added later.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ops-warning-soft)] text-[var(--ops-warning)]">
          <LockKeyIcon aria-hidden="true" size={24} weight="duotone" />
        </div>
      </div>
    </Card>
  );
}
