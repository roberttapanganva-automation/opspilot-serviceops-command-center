import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import type { AppointmentListItem } from "@/components/calendar/CalendarList";

type AppointmentRow = {
  client_id: string | null;
  clients: {
    email: string | null;
    name: string;
  } | null;
  created_at: string;
  ends_at: string | null;
  id: string;
  job_id: string | null;
  location: string | null;
  notes: string | null;
  starts_at: string;
  status: AppointmentListItem["status"];
  title: string;
};

function normalizeAppointment(row: AppointmentRow): AppointmentListItem {
  return {
    client: row.clients
      ? {
          email: row.clients.email,
          name: row.clients.name,
        }
      : null,
    client_id: row.client_id,
    created_at: row.created_at,
    ends_at: row.ends_at,
    id: row.id,
    job_id: row.job_id,
    location: row.location,
    notes: row.notes,
    starts_at: row.starts_at,
    status: row.status,
    title: row.title,
  };
}

export async function getAppointmentsForActiveWorkspace(): Promise<
  AppointmentListItem[]
> {
  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id,client_id,job_id,title,starts_at,ends_at,location,status,notes,created_at,clients(name,email)",
    )
    .eq("workspace_id", activeWorkspace.context.workspace.id)
    .order("starts_at", { ascending: true })
    .returns<AppointmentRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeAppointment);
}
