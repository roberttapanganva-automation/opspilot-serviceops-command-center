import { UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const roles = ["owner", "admin", "manager", "staff", "viewer"];

export function TeamSettingsPlaceholder() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--ops-text)]">
            Team
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--ops-text-soft)]">
            Team invitations and role management will be added later.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ops-info-soft)] text-[var(--ops-info)]">
          <UsersThreeIcon aria-hidden="true" size={24} weight="duotone" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {roles.map((role) => (
          <Badge key={role} variant={role === "owner" ? "default" : "info"}>
            {role}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
