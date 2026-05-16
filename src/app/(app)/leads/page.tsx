import Link from "next/link";
import { getClientsForActiveWorkspace } from "@/lib/clients/queries";
import { getLeadsForActiveWorkspace } from "@/lib/leads/queries";
import { getLeadPipelineStageOptionsForActiveWorkspace } from "@/lib/pipelines/queries";
import { getEffectiveRolePermission } from "@/lib/permissions/effective";
import {
  canCreateOperationalRecords,
  canDeleteOperationalRecords,
} from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import { ContactsPanel } from "@/components/leads/ContactsPanel";
import { LeadsList } from "@/components/leads/LeadsList";

type LeadsPageProps = {
  searchParams?: Promise<{
    tab?: string | string[];
  }>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const tabParam = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const activeTab = tabParam === "contacts" ? "contacts" : "leads";
  const activeWorkspace = await getActiveWorkspace();
  const supabase = await createClient();
  const [leads, clients, stageOptions] = await Promise.all([
    getLeadsForActiveWorkspace(),
    getClientsForActiveWorkspace(),
    getLeadPipelineStageOptionsForActiveWorkspace(),
  ]);
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
  const canDeleteRecords =
    activeWorkspace.status === "ready" &&
    canDeleteOperationalRecords(activeWorkspace.context.role);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-xl border border-[var(--ops-border)] bg-white p-2 shadow-sm">
        <div
          aria-label="Leads module sections"
          className="flex flex-wrap gap-2"
          role="tablist"
        >
          <Link
            aria-selected={activeTab === "leads"}
            className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${
              activeTab === "leads"
                ? "bg-[var(--workspace-primary,var(--ops-primary))] text-white shadow-[0_10px_24px_var(--workspace-primary-glow,var(--ops-primary-glow))]"
                : "text-[var(--ops-text-soft)] hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)]"
            }`}
            href="/leads?tab=leads"
            role="tab"
          >
            Leads
          </Link>
          <Link
            aria-selected={activeTab === "contacts"}
            className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${
              activeTab === "contacts"
                ? "bg-[var(--workspace-primary,var(--ops-primary))] text-white shadow-[0_10px_24px_var(--workspace-primary-glow,var(--ops-primary-glow))]"
                : "text-[var(--ops-text-soft)] hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)]"
            }`}
            href="/leads?tab=contacts"
            role="tab"
          >
            Contacts
          </Link>
        </div>
      </div>

      {activeTab === "leads" ? (
        <>
          <LeadsList
            canCreateRecords={canCreateRecords}
            canDeleteRecords={canDeleteRecords}
            clients={clients}
            leads={leads}
            stageOptions={stageOptions}
          />
        </>
      ) : (
        <ContactsPanel canCreateRecords={canCreateRecords} clients={clients} />
      )}
    </div>
  );
}
