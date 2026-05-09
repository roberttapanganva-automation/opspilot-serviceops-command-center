import { CalendarList } from "@/components/calendar/CalendarList";
import { CalendarPageHeader } from "@/components/calendar/CalendarPageHeader";
import {
  CalendarToolbar,
  type CalendarFilter,
} from "@/components/calendar/CalendarToolbar";
import { getAppointmentsForActiveWorkspace } from "@/lib/appointments/queries";
import { getEffectiveRolePermission } from "@/lib/permissions/effective";
import {
  canCreateOperationalRecords,
  canDeleteOperationalRecords,
} from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";

type CalendarPageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

function getCalendarFilter(value: string | undefined): CalendarFilter {
  if (value === "today" || value === "completed") {
    return value;
  }

  return "upcoming";
}

function getDateKey(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: timezone,
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }
}

function filterAppointments(
  appointments: Awaited<ReturnType<typeof getAppointmentsForActiveWorkspace>>,
  activeFilter: CalendarFilter,
  timezone: string,
) {
  const now = new Date();
  const todayKey = getDateKey(now.toISOString(), timezone);

  if (activeFilter === "today") {
    return appointments.filter(
      (appointment) =>
        appointment.status !== "cancelled" &&
        getDateKey(appointment.starts_at, timezone) === todayKey,
    );
  }

  if (activeFilter === "completed") {
    return appointments.filter(
      (appointment) => appointment.status === "completed",
    );
  }

  return appointments.filter(
    (appointment) =>
      appointment.status !== "completed" &&
      appointment.status !== "cancelled" &&
      new Date(appointment.starts_at).getTime() >= now.getTime(),
  );
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const activeFilter = getCalendarFilter(params.filter);
  const activeWorkspace = await getActiveWorkspace();
  const supabase = await createClient();
  const appointments = await getAppointmentsForActiveWorkspace();
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
    rolePermission?.can_create_appointments !== false;
  const canDeleteRecords =
    activeWorkspace.status === "ready" &&
    canDeleteOperationalRecords(activeWorkspace.context.role);
  const timezone =
    activeWorkspace.status === "ready"
      ? activeWorkspace.context.workspace.timezone
      : "UTC";
  const filteredAppointments = filterAppointments(
    appointments,
    activeFilter,
    timezone,
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <CalendarPageHeader canCreateRecords={canCreateRecords} />
      <CalendarToolbar activeFilter={activeFilter} />
      <CalendarList
        appointments={filteredAppointments}
        canCreateRecords={canCreateRecords}
        canDeleteRecords={canDeleteRecords}
      />
    </div>
  );
}
