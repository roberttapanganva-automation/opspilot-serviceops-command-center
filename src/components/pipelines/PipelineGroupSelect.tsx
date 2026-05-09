"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PipelineGroup } from "@/types/domain";

type PipelineGroupSelectProps = {
  groups: PipelineGroup[];
  selectedGroupId: string | null;
};

export function PipelineGroupSelect({
  groups,
  selectedGroupId,
}: PipelineGroupSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--ops-border-strong)] bg-[var(--ops-card-soft)] px-3 py-2 text-sm text-[var(--ops-text-soft)]">
        No pipelines configured yet
      </div>
    );
  }

  return (
    <div>
      <label
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ops-text-muted)]"
        htmlFor="pipeline-group-select"
      >
        Pipeline
      </label>
      <select
        className="mt-2 h-10 min-w-[240px] rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
        id="pipeline-group-select"
        onChange={(event) => {
          const next = new URLSearchParams(searchParams.toString());

          if (event.target.value) {
            next.set("pipeline", event.target.value);
          } else {
            next.delete("pipeline");
          }

          const queryString = next.toString();
          router.push(queryString ? `${pathname}?${queryString}` : pathname);
        }}
        value={selectedGroupId ?? ""}
      >
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name} - {group.entity_type === "lead" ? "Leads" : "Jobs"}
          </option>
        ))}
      </select>
    </div>
  );
}
