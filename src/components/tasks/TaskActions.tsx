"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ApiResponse } from "@/types/api";

type TaskActionsProps = {
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

export function TaskActions({ taskId }: TaskActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markDone() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        body: JSON.stringify({ status: "done" }),
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

  return (
    <div className="space-y-2">
      <Button
        className="h-9 gap-2 px-3"
        disabled={isLoading}
        onClick={markDone}
        type="button"
        variant="secondary"
      >
        <CheckIcon aria-hidden="true" size={18} weight="regular" />
        {isLoading ? "Updating..." : "Mark done"}
      </Button>
      {error ? (
        <p className="max-w-48 text-xs leading-5 text-[var(--ops-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
