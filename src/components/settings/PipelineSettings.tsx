"use client";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiResponse } from "@/types/api";
import type { PipelineStage } from "@/types/domain";

type PipelineSettingsProps = {
  canManageSettings: boolean;
  stages: PipelineStage[];
};

type StageResponse = PipelineStage;

function getErrorMessage(response: ApiResponse<StageResponse>) {
  return response.ok ? null : response.error.message;
}

function stagePayloadFromForm(form: HTMLFormElement) {
  const formData = new FormData(form);

  return {
    color: String(formData.get("color") ?? ""),
    is_closed: formData.get("is_closed") === "on",
    is_lost: formData.get("is_lost") === "on",
    is_won: formData.get("is_won") === "on",
    name: String(formData.get("name") ?? ""),
    order_index: Number(formData.get("order_index") ?? 0),
  };
}

function StageRow({
  canManageSettings,
  onDelete,
  onSave,
  stage,
}: {
  canManageSettings: boolean;
  onDelete: (stageId: string) => Promise<void>;
  onSave: (stageId: string, form: HTMLFormElement) => Promise<void>;
  stage: PipelineStage;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const disabled = !canManageSettings || isSaving || isDeleting;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    await onSave(stage.id, event.currentTarget);
    setIsSaving(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    await onDelete(stage.id);
    setIsDeleting(false);
  }

  return (
    <form
      className="rounded-lg border border-[var(--ops-border)] bg-white p-3"
      onSubmit={handleSave}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(160px,1fr)_110px_100px]">
        <div>
          <label
            className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]"
            htmlFor={`stage-name-${stage.id}`}
          >
            Name
          </label>
          <input
            className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
            defaultValue={stage.name}
            disabled={disabled}
            id={`stage-name-${stage.id}`}
            name="name"
            required
            type="text"
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]"
            htmlFor={`stage-color-${stage.id}`}
          >
            Color
          </label>
          <input
            className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
            defaultValue={stage.color}
            disabled={disabled}
            id={`stage-color-${stage.id}`}
            name="color"
            required
            type="text"
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]"
            htmlFor={`stage-order-${stage.id}`}
          >
            Order
          </label>
          <input
            className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
            defaultValue={stage.order_index}
            disabled={disabled}
            id={`stage-order-${stage.id}`}
            min={0}
            name="order_index"
            type="number"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--ops-text-soft)]">
        {[
          ["is_closed", "Closed", stage.is_closed],
          ["is_won", "Won", stage.is_won],
          ["is_lost", "Lost", stage.is_lost],
        ].map(([key, label, checked]) => (
          <label className="inline-flex items-center gap-2" key={String(key)}>
            <input
              className="h-4 w-4 accent-[var(--ops-primary)]"
              defaultChecked={Boolean(checked)}
              disabled={disabled}
              name={String(key)}
              type="checkbox"
            />
            {label}
          </label>
        ))}
      </div>

      {canManageSettings ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button disabled={disabled} type="submit" variant="secondary">
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            className="gap-2 text-[var(--ops-danger)]"
            disabled={disabled}
            onClick={handleDelete}
            type="button"
            variant="ghost"
          >
            <TrashIcon aria-hidden="true" size={16} weight="regular" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

function AddStageForm({
  canManageSettings,
  entityType,
  onAdd,
}: {
  canManageSettings: boolean;
  entityType: "lead" | "job";
  onAdd: (form: HTMLFormElement, entityType: "lead" | "job") => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await onAdd(event.currentTarget, entityType);
    event.currentTarget.reset();
    setIsSubmitting(false);
  }

  if (!canManageSettings) {
    return null;
  }

  return (
    <form
      className="rounded-lg border border-dashed border-[var(--ops-border-strong)] bg-[var(--ops-card-soft)] p-3"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 md:grid-cols-[minmax(160px,1fr)_120px_100px_auto]">
        <input
          className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
          name="name"
          placeholder={`Add ${entityType} stage`}
          required
          type="text"
        />
        <input
          className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
          defaultValue="#6D5DFC"
          name="color"
          required
          type="text"
        />
        <input
          className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
          defaultValue={0}
          min={0}
          name="order_index"
          type="number"
        />
        <Button className="gap-2" disabled={isSubmitting} type="submit">
          <PlusIcon aria-hidden="true" size={16} weight="regular" />
          {isSubmitting ? "Adding..." : "Add"}
        </Button>
      </div>
    </form>
  );
}

export function PipelineSettings({
  canManageSettings,
  stages,
}: PipelineSettingsProps) {
  const router = useRouter();
  const [pipelineStages, setPipelineStages] = useState(stages);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function addStage(form: HTMLFormElement, entityType: "lead" | "job") {
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/settings/pipeline-stages", {
      body: JSON.stringify({
        ...stagePayloadFromForm(form),
        entity_type: entityType,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = (await response.json()) as ApiResponse<StageResponse>;
    const message = getErrorMessage(result);

    if (!response.ok || message) {
      setError(message ?? "We could not create the stage.");
      return;
    }

    if (result.ok) {
      setPipelineStages((current) =>
        [...current, result.data].sort(
          (first, second) => first.order_index - second.order_index,
        ),
      );
      setSuccess("Pipeline stage created.");
      router.refresh();
    }
  }

  async function saveStage(stageId: string, form: HTMLFormElement) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/settings/pipeline-stages/${stageId}`, {
      body: JSON.stringify(stagePayloadFromForm(form)),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });
    const result = (await response.json()) as ApiResponse<StageResponse>;
    const message = getErrorMessage(result);

    if (!response.ok || message) {
      setError(message ?? "We could not update the stage.");
      return;
    }

    if (result.ok) {
      setPipelineStages((current) =>
        current
          .map((stage) => (stage.id === result.data.id ? result.data : stage))
          .sort((first, second) => first.order_index - second.order_index),
      );
      setSuccess("Pipeline stage updated.");
      router.refresh();
    }
  }

  async function deleteStage(stageId: string) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/settings/pipeline-stages/${stageId}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as ApiResponse<{ id: string }>;
    const message = result.ok ? null : result.error.message;

    if (!response.ok || message) {
      setError(message ?? "We could not delete the stage.");
      return;
    }

    setPipelineStages((current) =>
      current.filter((stage) => stage.id !== stageId),
    );
    setSuccess("Pipeline stage deleted.");
    router.refresh();
  }

  const leadStages = pipelineStages.filter(
    (stage) => stage.entity_type === "lead",
  );
  const jobStages = pipelineStages.filter((stage) => stage.entity_type === "job");
  const stageGroups: Array<{
    entityType: "lead" | "job";
    stages: PipelineStage[];
    title: string;
  }> = [
    {
      entityType: "lead",
      stages: leadStages,
      title: "Lead stages",
    },
    {
      entityType: "job",
      stages: jobStages,
      title: "Job stages",
    },
  ];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-[var(--ops-text)]">
            Pipeline
          </h2>
          <Badge variant={canManageSettings ? "default" : "warning"}>
            {canManageSettings ? "Manage stages" : "Read only"}
          </Badge>
        </div>
        <p className="text-sm text-[var(--ops-text-soft)]">
          Basic lead and job stage setup. Records stay protected by workspace
          RLS.
        </p>
      </div>

      {error ? (
        <p
          className="mt-5 rounded-lg bg-[var(--ops-danger-soft)] p-3 text-sm text-[var(--ops-danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-5 rounded-lg bg-[var(--ops-success-soft)] p-3 text-sm text-[var(--ops-success)]">
          {success}
        </p>
      ) : null}

      {pipelineStages.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            description="No pipeline stages yet. Add stages to organize leads and jobs."
            title="No pipeline stages yet"
          />
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {stageGroups.map(({ entityType, stages: groupedStages, title }) => (
          <div
            className="rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-4"
            key={entityType}
          >
            <h3 className="font-semibold text-[var(--ops-text)]">{title}</h3>
            <div className="mt-4 space-y-3">
              {groupedStages.map((stage) => (
                <StageRow
                  canManageSettings={canManageSettings}
                  key={stage.id}
                  onDelete={deleteStage}
                  onSave={saveStage}
                  stage={stage}
                />
              ))}
              <AddStageForm
                canManageSettings={canManageSettings}
                entityType={entityType}
                onAdd={addStage}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
