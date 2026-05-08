import { CalendarList } from "@/components/calendar/CalendarList";
import { CalendarPageHeader } from "@/components/calendar/CalendarPageHeader";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import { getAppointmentsForActiveWorkspace } from "@/lib/appointments/queries";
import { getEffectiveRolePermission } from "@/lib/permissions/effective";
import { canCreateOperationalRecords } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";

export default async function CalendarPage() {
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

  return (
    <div className="space-y-5 sm:space-y-6">
      <CalendarPageHeader canCreateRecords={canCreateRecords} />
      <CalendarToolbar />
      <CalendarList
        appointments={appointments}
        canCreateRecords={canCreateRecords}
      />
    </div>
  );
}
