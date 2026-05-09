"use client";

import { PencilSimpleLineIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { PipelineStagesManager } from "@/components/owner/pipeline/PipelineStagesManager";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiResponse } from "@/types/api";
import type { PipelineGroup, PipelineStage } from "@/types/domain";

type PipelineGroupsManagerProps = {
  groups: PipelineGroup[];
  stages: PipelineStage[];
};

function sortGroups(groups: PipelineGroup[]) {
  const entityOrder = {
    lead: 0,
    job: 1,
  } as const;

  return [...groups].sort((first, second) => {
    if (entityOrder[first.entity_type] !== entityOrder[second.entity_type]) {
      return entityOrder[first.entity_type] - entityOrder[second.entity_type];
    }

    if (first.order_index !== second.order_index) {
      return first.order_index - second.order_index;
    }

    return (
      new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
    );
  });
}

function sortStages(stages: PipelineStage[]) {
  return [...stages].sort((first, second) => {
    if (first.order_index !== second.order_index) {
      return first.order_index - second.order_index;
    }

    return (
      new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
    );
  });
}

function normalizeGroups(current: PipelineGroup[], nextGroup: PipelineGroup) {
  const base = current.some((group) => group.id === nextGroup.id)
    ? current.map((group) =>
        group.id === nextGroup.id
          ? nextGroup
          : nextGroup.is_default && group.entity_type === nextGroup.entity_type
            ? { ...group, is_default: false }
            : group,
      )
    : [
        ...current.map((group) =>
          nextGroup.is_default && group.entity_type === nextGroup.entity_type
            ? { ...group, is_default: false }
            : group,
        ),
        nextGroup,
      ];

  return sortGroups(base);
}

function GroupRow({
  group,
  isSelected,
  onDelete,
  onSave,
  onSelect,
}: {
  group: PipelineGroup;
  isSelected: boolean;
  onDelete: (groupId: string) => Promise<void>;
  onSave: (
    groupId: string,
    payload: {
      description: string;
      entity_type: PipelineGroup["entity_type"];
      is_default: boolean;
      name: string;
      order_index: number;
    },
  ) => Promise<void>;
  onSelect: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    try {
      await onSave(group.id, {
        description: String(formData.get("description") ?? ""),
        entity_type: String(formData.get("entity_type") ?? group.entity_type) as PipelineGroup["entity_type"],
        is_default: formData.get("is_default") === "on",
        name: String(formData.get("name") ?? ""),
        order_index: Number(formData.get("order_index") ?? 0),
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await onDelete(group.id);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form
      className={`rounded-lg border p-4 transition ${
        isSelected
          ? "border-[var(--workspace-primary,var(--ops-primary))] bg-[var(--workspace-primary-soft,var(--ops-primary-soft))]"
          : "border-[var(--ops-border)] bg-white"
      }`}
      onSubmit={handleSubmit}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[var(--ops-text)]">
              {group.name}
            </p>
            {group.is_default ? <Badge variant="success">Default</Badge> : null}
            <Badge variant="default">
              {group.entity_type === "lead" ? "Leads" : "Jobs"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[var(--ops-text-soft)]">
            {group.description?.trim() || "No description yet."}
          </p>
        </div>

        <Button
          className="h-9 gap-2 px-3"
          onClick={onSelect}
          type="button"
          variant={isSelected ? "primary" : "secondary"}
        >
          <PencilSimpleLineIcon aria-hidden="true" size={16} weight="regular" />
          {isSelected ? "Selected" : "Manage"}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(140px,1fr)_120px_100px]">
        <input
          className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
          defaultValue={group.name}
          disabled={isSaving || isDeleting}
          name="name"
          placeholder="Pipeline name"
          required
          type="text"
        />
        <select
          className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
          defaultValue={group.entity_type}
          disabled={isSaving || isDeleting}
          name="entity_type"
        >
          <option value="lead">Lead</option>
          <option value="job">Job</option>
        </select>
        <input
          className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
          defaultValue={group.order_index}
          disabled={isSaving || isDeleting}
          min={0}
          name="order_index"
          type="number"
        />
      </div>

      <textarea
        className="mt-3 min-h-20 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 py-2 text-sm text-[var(--ops-text)] outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
        defaultValue={group.description ?? ""}
        disabled={isSaving || isDeleting}
        name="description"
        placeholder="Describe what this pipeline manages."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-[var(--ops-text-soft)]">
          <input
            className="h-4 w-4 accent-[var(--workspace-primary,var(--ops-primary))]"
            defaultChecked={group.is_default}
            disabled={isSaving || isDeleting}
            name="is_default"
            type="checkbox"
          />
          Default pipeline
        </label>

        <div className="flex flex-wrap gap-2">
          <Button disabled={isSaving || isDeleting} type="submit" variant="secondary">
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            className="gap-2 text-[var(--ops-danger)]"
            disabled={isSaving || isDeleting}
            onClick={handleDelete}
            type="button"
            variant="ghost"
          >
            <TrashIcon aria-hidden="true" size={16} weight="regular" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function PipelineGroupsManager({
  groups,
  stages,
}: PipelineGroupsManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [pipelineGroups, setPipelineGroups] = useState(sortGroups(groups));
  const [pipelineStages, setPipelineStages] = useState(sortStages(stages));
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    sortGroups(groups).find((group) => group.is_default)?.id ??
      sortGroups(groups)[0]?.id ??
      null,
  );
  const effectiveSelectedGroupId =
    selectedGroupId && pipelineGroups.some((group) => group.id === selectedGroupId)
      ? selectedGroupId
      : pipelineGroups.find((group) => group.is_default)?.id ??
        pipelineGroups[0]?.id ??
        null;

  const selectedGroup =
    pipelineGroups.find((group) => group.id === effectiveSelectedGroupId) ?? null;
  const selectedStages = useMemo(
    () =>
      sortStages(
        pipelineStages.filter(
          (stage) => stage.pipeline_group_id === effectiveSelectedGroupId,
        ),
      ),
    [effectiveSelectedGroupId, pipelineStages],
  );

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsCreatingGroup(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/owner/pipeline-groups", {
        body: JSON.stringify({
          description: String(formData.get("description") ?? ""),
          entity_type: String(formData.get("entity_type") ?? "lead"),
          is_default: formData.get("is_default") === "on",
          name: String(formData.get("name") ?? ""),
          order_index: Number(formData.get("order_index") ?? 0),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as ApiResponse<PipelineGroup>;

      if (!response.ok || !result.ok) {
        setError(result.ok ? "We could not create the pipeline group." : result.error.message);
        return;
      }

      setPipelineGroups((current) => normalizeGroups(current, result.data));
      setSelectedGroupId(result.data.id);
      setSuccess("Pipeline group created.");
      event.currentTarget.reset();
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not create the pipeline group.",
      );
    } finally {
      setIsCreatingGroup(false);
    }
  }

  async function updateGroup(
    groupId: string,
    payload: {
      description: string;
      entity_type: PipelineGroup["entity_type"];
      is_default: boolean;
      name: string;
      order_index: number;
    },
  ) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/owner/pipeline-groups/${groupId}`, {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });
    const result = (await response.json()) as ApiResponse<PipelineGroup>;

    if (!response.ok || !result.ok) {
      setError(result.ok ? "We could not update the pipeline group." : result.error.message);
      return;
    }

    setPipelineGroups((current) => normalizeGroups(current, result.data));
    setSuccess("Pipeline group updated.");
    router.refresh();
  }

  async function deleteGroup(groupId: string) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/owner/pipeline-groups/${groupId}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as ApiResponse<{ id: string }>;

    if (!response.ok || !result.ok) {
      setError(result.ok ? "We could not delete the pipeline group." : result.error.message);
      return;
    }

    setPipelineGroups((current) => current.filter((group) => group.id !== groupId));
    setPipelineStages((current) =>
      current.filter((stage) => stage.pipeline_group_id !== groupId),
    );
    setSuccess("Pipeline group deleted.");
    router.refresh();
  }

  async function createStage(
    group: PipelineGroup,
    payload: {
      color: string;
      entity_type: PipelineGroup["entity_type"];
      is_closed: boolean;
      is_lost: boolean;
      is_won: boolean;
      name: string;
      order_index: number;
      pipeline_group_id: string;
    },
  ) {
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/owner/pipeline-stages", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = (await response.json()) as ApiResponse<PipelineStage>;

    if (!response.ok || !result.ok) {
      setError(result.ok ? "We could not create the stage." : result.error.message);
      return;
    }

    setPipelineStages((current) => sortStages([...current, result.data]));
    setSelectedGroupId(group.id);
    setSuccess("Stage created.");
    router.refresh();
  }

  async function updateStage(
    stageId: string,
    payload: {
      color: string;
      is_closed: boolean;
      is_lost: boolean;
      is_won: boolean;
      name: string;
      order_index: number;
    },
  ) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/owner/pipeline-stages/${stageId}`, {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });
    const result = (await response.json()) as ApiResponse<PipelineStage>;

    if (!response.ok || !result.ok) {
      setError(result.ok ? "We could not update the stage." : result.error.message);
      return;
    }

    setPipelineStages((current) =>
      sortStages(
        current.map((stage) => (stage.id === stageId ? result.data : stage)),
      ),
    );
    setSuccess("Stage updated.");
    router.refresh();
  }

  async function deleteStage(stageId: string) {
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/owner/pipeline-stages/${stageId}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as ApiResponse<{ id: string }>;

    if (!response.ok || !result.ok) {
      setError(result.ok ? "We could not delete the stage." : result.error.message);
      return;
    }

    setPipelineStages((current) => current.filter((stage) => stage.id !== stageId));
    setSuccess("Stage deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {error ? (
        <p
          className="rounded-lg bg-[var(--ops-danger-soft)] p-3 text-sm text-[var(--ops-danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg bg-[var(--ops-success-soft)] p-3 text-sm text-[var(--ops-success)]">
          {success}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-xl border border-[var(--ops-border)] bg-[var(--ops-card)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-[var(--ops-text)]">
              Pipeline groups
            </h2>
            <Badge variant="default">Owner only</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--ops-text-soft)]">
            Create lead and job pipeline folders, choose defaults, and control
            ordering for the workspace board.
          </p>

          <form
            className="mt-5 rounded-lg border border-dashed border-[var(--ops-border-strong)] bg-[var(--ops-card-soft)] p-4"
            onSubmit={createGroup}
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(140px,1fr)_120px_100px]">
              <input
                className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                disabled={isCreatingGroup}
                name="name"
                placeholder="Pipeline group name"
                required
                type="text"
              />
              <select
                className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                defaultValue="lead"
                disabled={isCreatingGroup}
                name="entity_type"
              >
                <option value="lead">Lead</option>
                <option value="job">Job</option>
              </select>
              <input
                className="h-10 rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                defaultValue={pipelineGroups.length}
                disabled={isCreatingGroup}
                min={0}
                name="order_index"
                type="number"
              />
            </div>

            <textarea
              className="mt-3 min-h-20 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 py-2 text-sm text-[var(--ops-text)] outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
              disabled={isCreatingGroup}
              name="description"
              placeholder="Optional description for this workflow."
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-[var(--ops-text-soft)]">
                <input
                  className="h-4 w-4 accent-[var(--workspace-primary,var(--ops-primary))]"
                  disabled={isCreatingGroup}
                  name="is_default"
                  type="checkbox"
                />
                Set as default
              </label>
              <Button className="gap-2" disabled={isCreatingGroup} type="submit">
                <PlusIcon aria-hidden="true" size={16} weight="regular" />
                {isCreatingGroup ? "Creating..." : "Add group"}
              </Button>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {pipelineGroups.length === 0 ? (
              <EmptyState
                description="No pipeline groups yet. Add the first group to start defining workflows."
                title="No groups configured"
              />
            ) : (
              pipelineGroups.map((group) => (
                <GroupRow
                  group={group}
                  isSelected={group.id === effectiveSelectedGroupId}
                  key={group.id}
                  onDelete={deleteGroup}
                  onSave={updateGroup}
                  onSelect={() => setSelectedGroupId(group.id)}
                />
              ))
            )}
          </div>
        </div>

        <PipelineStagesManager
          group={selectedGroup}
          onCreate={createStage}
          onDelete={deleteStage}
          onUpdate={updateStage}
          stages={selectedStages}
        />
      </div>
    </div>
  );
}
