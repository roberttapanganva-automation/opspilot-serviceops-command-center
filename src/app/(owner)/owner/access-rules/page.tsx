import { RolePermissionsForm } from "@/components/owner/access-rules/RolePermissionsForm";
import { getWorkspaceRolePermissions } from "@/lib/owner/queries";

export default async function OwnerAccessRulesPage() {
  const permissions = await getWorkspaceRolePermissions();

  if (!permissions) {
    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-xl border border-[var(--ops-border)] bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-[var(--ops-text)]">
          Access Rules
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
          Configure safe role permissions for admin, manager, staff, and viewer.
          Owner access is always full and cannot be edited here.
        </p>
      </section>
      <RolePermissionsForm permissions={permissions} />
    </div>
  );
}
