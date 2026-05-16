"use client";

import {
  TrashIcon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "@/types/api";
import { EditTaskDialog } from "./EditTaskDialog";
import type { TaskListItem } from "./TasksList";

type TaskActionsProps = {
  canDeleteRecords: boolean;
  task: TaskListItem;
};

type UpdatedTask = {
  id: string;
};

function getErrorMessage(response: ApiResponse<UpdatedTask>) {
  if (response.ok) {
    return null;
  }

  return response.error.message;
}

export function TaskActions({
  canDeleteRecords,
  task,
}: TaskActionsProps) {
  const router = useRouter();
  const status = task.status;
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(nextStatus: "done" | "todo") {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        body: JSON.stringify({ status: nextStatus }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const result = (await response.json()) as ApiResponse<UpdatedTask>;
      const message = getErrorMessage(result);

      if (!response.ok || message) {
        setError(message ?? "We could not update the task. Please try again.");
        return;
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not update the task. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteTask() {
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as ApiResponse<UpdatedTask>;
      const message = getErrorMessage(result);

      if (!response.ok || message) {
        setError(message ?? "We could not delete the task. Please try again.");
        return;
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not delete the task. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          aria-label={status === "done" ? "Mark task undone" : "Mark task done"}
          className={`h-9 w-9 rounded-lg p-0 ${
            status === "done"
              ? "border-[var(--ops-success)] bg-[var(--ops-success-soft)] text-[var(--ops-success)]"
              : "text-[var(--ops-text-soft)]"
          }`}
          disabled={isLoading || isDeleting}
          onClick={() => updateStatus(status === "done" ? "todo" : "done")}
          title={status === "done" ? "Mark undone" : "Mark done"}
          type="button"
          variant="secondary"
        >
          <motion.svg
            aria-hidden="true"
            fill="none"
            height="18"
            initial={false}
            viewBox="0 0 256 256"
            width="18"
          >
            <motion.rect
              animate={{
                fill: status === "done" ? "currentColor" : "transparent",
                strokeOpacity: status === "done" ? 1 : 0.55,
              }}
              height="176"
              rx="36"
              stroke="currentColor"
              strokeWidth="24"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              width="176"
              x="40"
              y="40"
            />
            <motion.path
              animate={{
                opacity: status === "done" ? 0 : 0.9,
                scaleX: status === "done" ? 0.35 : 1,
              }}
              d="M72 128H184"
              initial={false}
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="24"
              style={{ originX: 0.5, originY: 0.5 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
            <motion.g
              animate={{
                opacity: status === "done" ? 1 : 0,
                scale: status === "done" ? 1 : 0.72,
              }}
              initial={false}
              style={{ originX: 0.5, originY: 0.5 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <motion.polyline
                animate={{
                  pathLength: status === "done" ? 1 : 0,
                }}
                initial={false}
                pathLength={0}
                points="40 144 96 200 224 72"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="16"
                transition={{ duration: 0.32, ease: "easeInOut" }}
              />
            </motion.g>
          </motion.svg>
          <span className="sr-only">
            {isLoading
              ? "Updating task"
              : status === "done"
                ? "Mark undone"
                : "Mark done"}
          </span>
        </Button>
        {canDeleteRecords ? <EditTaskDialog task={task} /> : null}
        {canDeleteRecords ? (
          <button
            aria-label="Delete task"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white text-[var(--ops-danger)] shadow-sm transition hover:border-[var(--ops-danger)] hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || isDeleting}
            onClick={deleteTask}
            title="Delete task"
            type="button"
          >
            <TrashIcon aria-hidden="true" size={18} weight="regular" />
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="max-w-48 text-xs leading-5 text-[var(--ops-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
