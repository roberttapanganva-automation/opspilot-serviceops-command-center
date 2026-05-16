import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import type { ClientSummary } from "@/types/domain";
import type { LeadListItem } from "@/components/leads/LeadsList";

type LeadRow = {
  client_id: string | null;
  clients: ClientSummary | null;
  created_at: string;
  estimated_value: number | string;
  id: string;
  next_follow_up_at: string | null;
  priority: LeadListItem["priority"];
  source: string | null;
  stage_id: string | null;
  status: LeadListItem["status"];
  title: string;
};

function normalizeLead(row: LeadRow): LeadListItem {
  return {
    client: row.clients,
    client_id: row.client_id,
    created_at: row.created_at,
    estimated_value:
      typeof row.estimated_value === "number"
        ? row.estimated_value
        : Number(row.estimated_value),
    id: row.id,
    next_follow_up_at: row.next_follow_up_at,
    priority: row.priority,
    source: row.source,
    stage_id: row.stage_id,
    status: row.status,
    title: row.title,
  };
}

export async function getLeadsForActiveWorkspace(): Promise<LeadListItem[]> {
  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id,client_id,title,source,estimated_value,priority,status,stage_id,next_follow_up_at,created_at,clients(id,name,email,phone,company_name,source)",
    )
    .eq("workspace_id", activeWorkspace.context.workspace.id)
    .order("created_at", { ascending: false })
    .returns<LeadRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeLead);
}
