import { JobsList } from "@/components/jobs/JobsList";
import { JobsPageHeader } from "@/components/jobs/JobsPageHeader";
import { JobsToolbar } from "@/components/jobs/JobsToolbar";
import { getJobsForActiveWorkspace } from "@/lib/jobs/queries";
import { getEffectiveRolePermission } from "@/lib/permissions/effective";
import { canCreateOperationalRecords } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";

export default async function JobsPage() {
  const activeWorkspace = await getActiveWorkspace();
  const supabase = await createClient();
  const jobs = await getJobsForActiveWorkspace();
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
    rolePermission?.can_create_jobs !== false;

  return (
    <div className="space-y-5 sm:space-y-6">
      <JobsPageHeader canCreateRecords={canCreateRecords} />
      <JobsToolbar />
      <JobsList canCreateRecords={canCreateRecords} jobs={jobs} />
    </div>
  );
}
