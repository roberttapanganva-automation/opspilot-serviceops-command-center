"use client";

import {
  TrashIcon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "@/types/api";
import type { TaskStatus } from "./TaskStatusBadge";

type TaskActionsProps = {
  canDeleteRecords: boolean;
  status: TaskStatus;
  taskId: string;
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
  status,
  taskId,
}: TaskActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(nextStatus: "done" | "todo") {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
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
      const response = await fetch(`/api/tasks/${taskId}`, {
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
              ? "text-[var(--ops-primary-dark)] border-[var(--ops-primary)]"
              : "text-[var(--ops-success)]"
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
            viewBox="0 0 20 20"
            width="18"
          >
            <rect
              height="14"
              rx="3"
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              width="14"
              x="3"
              y="3"
            />
            <motion.path
              animate={{
                pathLength: status === "done" ? 1 : 0,
                opacity: status === "done" ? 1 : 0.5,
              }}
              d="M4.5 10.5L8.2 14.2L15.5 6.8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
          </motion.svg>
          <span className="sr-only">
            {isLoading
              ? "Updating task"
              : status === "done"
                ? "Mark undone"
                : "Mark done"}
          </span>
        </Button>
        {canDeleteRecords ? (
          <button
            aria-label="Delete task"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white text-[var(--ops-danger)] shadow-sm transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)] disabled:cursor-not-allowed disabled:opacity-50"
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
