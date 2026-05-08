import Link from "next/link";
import { ShieldWarningIcon } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui/Card";

export function OwnerRestrictedState() {
  return (
    <div className="min-h-screen bg-[var(--ops-main-bg)] p-6">
      <Card className="mx-auto mt-16 max-w-xl p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ops-warning-soft)] text-[var(--ops-warning)]">
          <ShieldWarningIcon aria-hidden="true" size={26} weight="duotone" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-[var(--ops-text)]">
          Owner Console is only available to the workspace owner.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ops-text-soft)]">
          Ask the workspace owner for access or return to the dashboard.
        </p>
        <Link
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--ops-primary)] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_var(--ops-primary-glow)] transition hover:bg-[var(--ops-primary-dark)]"
          href="/dashboard"
        >
          Back to Dashboard
        </Link>
      </Card>
    </div>
  );
}
