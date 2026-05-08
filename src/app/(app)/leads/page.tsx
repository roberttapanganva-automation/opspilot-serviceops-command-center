import { getLeadsForActiveWorkspace } from "@/lib/leads/queries";
import { getEffectiveRolePermission } from "@/lib/permissions/effective";
import { canCreateOperationalRecords } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import { LeadsList } from "@/components/leads/LeadsList";
import { LeadsPageHeader } from "@/components/leads/LeadsPageHeader";
import { LeadsToolbar } from "@/components/leads/LeadsToolbar";

export default async function LeadsPage() {
  const activeWorkspace = await getActiveWorkspace();
  const supabase = await createClient();
  const leads = await getLeadsForActiveWorkspace();
  const rolePermission =
    activeWorkspace.status === "ready"
      ? await getEffectiveRolePermission({
          role: activeWorkspace.context.role,
          supabase,
          workspaceId: activeWorkspace.context.workspace.id,
        })
      : null;
  const canCreateRecords =
    activeWorkspace.status === "ready" &&
    canCreateOperationalRecords(activeWorkspace.context.role) &&
    rolePermission?.can_create_leads !== false;

  return (
    <div className="space-y-5 sm:space-y-6">
      <LeadsPageHeader canCreateRecords={canCreateRecords} />
      <LeadsToolbar />
      <LeadsList canCreateRecords={canCreateRecords} leads={leads} />
    </div>
  );
}
