import { TasksList } from "@/components/tasks/TasksList";
import { TasksPageHeader } from "@/components/tasks/TasksPageHeader";
import { getEffectiveRolePermission } from "@/lib/permissions/effective";
import { canCreateOperationalRecords } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getTasksForActiveWorkspace } from "@/lib/tasks/queries";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";

export default async function TasksPage() {
  const activeWorkspace = await getActiveWorkspace();
  const supabase = await createClient();
  const tasks = await getTasksForActiveWorkspace();
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
    rolePermission?.can_create_tasks !== false;

  return (
    <div className="space-y-5 sm:space-y-6">
      <TasksPageHeader canCreateRecords={canCreateRecords} />
      <TasksList canCreateRecords={canCreateRecords} tasks={tasks} />
    </div>
  );
}
