import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import type { TaskListItem } from "@/components/tasks/TasksList";

type TaskRow = {
  completed_at: string | null;
  created_at: string;
  description: string | null;
  due_at: string | null;
  id: string;
  priority: TaskListItem["priority"];
  related_id: string | null;
  related_type: TaskListItem["related_type"];
  status: TaskListItem["status"];
  title: string;
};

function normalizeTask(row: TaskRow): TaskListItem {
  return {
    completed_at: row.completed_at,
    created_at: row.created_at,
    description: row.description,
    due_at: row.due_at,
    id: row.id,
    priority: row.priority,
    related_id: row.related_id,
    related_type: row.related_type,
    status: row.status,
    title: row.title,
  };
}

export async function getTasksForActiveWorkspace(): Promise<TaskListItem[]> {
  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id,title,description,due_at,priority,status,related_type,related_id,completed_at,created_at",
    )
    .eq("workspace_id", activeWorkspace.context.workspace.id)
    .order("created_at", { ascending: false })
    .returns<TaskRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeTask);
}
