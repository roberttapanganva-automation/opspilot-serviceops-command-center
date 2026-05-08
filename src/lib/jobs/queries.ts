import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import type { JobListItem } from "@/components/jobs/JobsList";

type JobRow = {
  client_id: string | null;
  clients: {
    email: string | null;
    name: string;
  } | null;
  created_at: string;
  estimated_value: number | string;
  id: string;
  location: string | null;
  payment_status: JobListItem["payment_status"];
  scheduled_end: string | null;
  scheduled_start: string | null;
  service_type: string | null;
  status: JobListItem["status"];
  title: string;
};

function normalizeJob(row: JobRow): JobListItem {
  return {
    client: row.clients
      ? {
          email: row.clients.email,
          name: row.clients.name,
        }
      : null,
    client_id: row.client_id,
    created_at: row.created_at,
    estimated_value:
      typeof row.estimated_value === "number"
        ? row.estimated_value
        : Number(row.estimated_value),
    id: row.id,
    location: row.location,
    payment_status: row.payment_status,
    scheduled_end: row.scheduled_end,
    scheduled_start: row.scheduled_start,
    service_type: row.service_type,
    status: row.status,
    title: row.title,
  };
}

export async function getJobsForActiveWorkspace(): Promise<JobListItem[]> {
  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id,client_id,title,service_type,scheduled_start,scheduled_end,location,estimated_value,payment_status,status,created_at,clients(name,email)",
    )
    .eq("workspace_id", activeWorkspace.context.workspace.id)
    .order("created_at", { ascending: false })
    .returns<JobRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeJob);
}
