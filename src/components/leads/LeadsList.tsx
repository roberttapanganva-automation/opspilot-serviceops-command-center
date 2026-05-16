"use client";

import {
  ArrowsDownUpIcon,
  CaretDownIcon,
  DotsThreeOutlineVerticalIcon,
  FadersHorizontalIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  DownloadSimpleIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DateTimeCell, DateTimeHeader } from "@/components/ui/DateTimeCell";
import { DeleteRecordButton } from "@/components/records/DeleteRecordButton";
import type { LeadPipelineStageOption } from "@/lib/pipelines/queries";
import type { Client, ClientSummary } from "@/types/domain";
import { AddLeadDialog } from "./AddLeadDialog";
import { EditLeadDialog } from "./EditLeadDialog";
import { LeadPriorityBadge, type LeadPriority } from "./LeadPriorityBadge";
import { LeadsEmptyState } from "./LeadsEmptyState";
import { LeadStatusBadge, type LeadStatus } from "./LeadStatusBadge";

export type LeadListItem = {
  client: ClientSummary | null;
  client_id: string | null;
  created_at: string;
  estimated_value: number;
  id: string;
  next_follow_up_at: string | null;
  priority: LeadPriority;
  source: string | null;
  stage_id: string | null;
  status: LeadStatus;
  title: string;
};

type LeadView = "all" | "open" | "won" | "lost" | "follow_up_due";
type LeadSort =
  | "newest"
  | "oldest"
  | "value_high"
  | "follow_up_soonest";

type LeadsListProps = {
  canCreateRecords: boolean;
  canDeleteRecords: boolean;
  clients: Client[];
  leads: LeadListItem[];
  stageOptions: LeadPipelineStageOption[];
};

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function getInitials(lead: LeadListItem) {
  const sourceName = lead.client?.name?.trim() || lead.title.trim();
  const parts = sourceName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "L";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function getFollowUpTimestamp(value: string | null) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function isFollowUpDue(lead: LeadListItem) {
  if (lead.status !== "open" || !lead.next_follow_up_at) {
    return false;
  }

  return getFollowUpTimestamp(lead.next_follow_up_at) <= Date.now();
}

function getContactSecondaryLine(lead: LeadListItem) {
  if (!lead.client) {
    return "No contact linked";
  }

  return lead.client.email ?? lead.client.phone ?? lead.client.company_name ?? "";
}

export function LeadsList({
  canCreateRecords,
  canDeleteRecords,
  clients,
  leads,
  stageOptions,
}: LeadsListProps) {
  const [activeView, setActiveView] = useState<LeadView>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | "all">("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<LeadSort>("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const stageMap = useMemo(
    () =>
      new Map(
        stageOptions.map((stage) => [
          stage.id,
          { name: stage.name },
        ]),
      ),
    [stageOptions],
  );

  const viewCounts = useMemo(
    () => ({
      all: leads.length,
      follow_up_due: leads.filter(isFollowUpDue).length,
      lost: leads.filter((lead) => lead.status === "lost").length,
      open: leads.filter((lead) => lead.status === "open").length,
      won: leads.filter((lead) => lead.status === "won").length,
    }),
    [leads],
  );

  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let nextLeads = leads.filter((lead) => {
      if (activeView === "open" && lead.status !== "open") {
        return false;
      }

      if (activeView === "won" && lead.status !== "won") {
        return false;
      }

      if (activeView === "lost" && lead.status !== "lost") {
        return false;
      }

      if (activeView === "follow_up_due" && !isFollowUpDue(lead)) {
        return false;
      }

      if (statusFilter !== "all" && lead.status !== statusFilter) {
        return false;
      }

      if (priorityFilter !== "all" && lead.priority !== priorityFilter) {
        return false;
      }

      if (stageFilter !== "all") {
        if (stageFilter === "__none__") {
          if (lead.stage_id) {
            return false;
          }
        } else if (lead.stage_id !== stageFilter) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      return [
        lead.title,
        lead.client?.name,
        lead.client?.email,
        lead.client?.phone,
        lead.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    nextLeads = [...nextLeads];

    if (sortBy === "oldest") {
      nextLeads.sort(
        (left, right) =>
          new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
      );
    } else if (sortBy === "value_high") {
      nextLeads.sort((left, right) => right.estimated_value - left.estimated_value);
    } else if (sortBy === "follow_up_soonest") {
      nextLeads.sort(
        (left, right) =>
          getFollowUpTimestamp(left.next_follow_up_at) -
          getFollowUpTimestamp(right.next_follow_up_at),
      );
    } else {
      nextLeads.sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      );
    }

    return nextLeads;
  }, [
    activeView,
    leads,
    priorityFilter,
    searchQuery,
    sortBy,
    stageFilter,
    statusFilter,
  ]);

  const allFilteredSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((lead) => selectedIds.includes(lead.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds((current) =>
        current.filter(
          (selectedId) => !filteredLeads.some((lead) => lead.id === selectedId),
        ),
      );
      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...filteredLeads.map((lead) => lead.id)]),
    ]);
  }

  function toggleLeadSelection(leadId: string) {
    setSelectedIds((current) =>
      current.includes(leadId)
        ? current.filter((selectedId) => selectedId !== leadId)
        : [...current, leadId],
    );
  }

  if (leads.length === 0) {
    return (
      <LeadsEmptyState
        canCreateRecords={canCreateRecords}
        clients={clients}
        stageOptions={stageOptions}
      />
    );
  }

  const showActions = canCreateRecords || canDeleteRecords;
  const viewOptions: Array<{ key: LeadView; label: string; count: number }> = [
    { key: "all", label: "All", count: viewCounts.all },
    { key: "open", label: "Open", count: viewCounts.open },
    { key: "won", label: "Won", count: viewCounts.won },
    { key: "lost", label: "Lost", count: viewCounts.lost },
    {
      key: "follow_up_due",
      label: "Follow-up due",
      count: viewCounts.follow_up_due,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--ops-border)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-[var(--ops-text)]">
                Leads
              </h2>
              <span className="inline-flex items-center rounded-full bg-[var(--ops-card-soft)] px-3 py-1 text-sm font-semibold text-[var(--ops-text-soft)]">
                {leads.length} {leads.length === 1 ? "Lead" : "Leads"}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
              Keep the team focused on live opportunities, response timing, and the next best follow-up across the active workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-4 text-sm font-semibold text-[var(--ops-text-soft)] opacity-75"
              disabled
              title="Lead import will be added later."
              type="button"
            >
              <DownloadSimpleIcon
                aria-hidden="true"
                className="mr-2"
                size={18}
                weight="regular"
              />
              Import leads
            </button>
            {canCreateRecords ? (
              <AddLeadDialog
                className="h-10"
                clients={clients}
                stageOptions={stageOptions}
                variant="primary"
              />
            ) : null}
            <button
              aria-label="More lead list actions"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] text-[var(--ops-text-soft)] opacity-75"
              disabled
              type="button"
            >
              <DotsThreeOutlineVerticalIcon aria-hidden="true" size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {viewOptions.map((view) => (
              <button
                className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                  activeView === view.key
                    ? "bg-[var(--workspace-primary-soft,var(--ops-primary-soft))] text-[var(--workspace-primary,var(--ops-primary-dark))]"
                    : "bg-[var(--ops-card-soft)] text-[var(--ops-text-soft)] hover:text-[var(--ops-text)]"
                }`}
                key={view.key}
                onClick={() => setActiveView(view.key)}
                type="button"
              >
                <span>{view.label}</span>
                <span className="text-xs opacity-80">{view.count}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-2.5 xl:grid-cols-[minmax(220px,1fr)_160px_160px_170px_150px_auto_auto]">
            <div className="relative min-w-0 xl:col-span-1">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
                size={16}
                weight="regular"
              />
              <input
                aria-label="Search leads"
                className="h-9 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pl-8 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search leads"
                type="search"
                value={searchQuery}
              />
            </div>

            <div className="relative min-w-0">
              <FunnelSimpleIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
                size={16}
                weight="regular"
              />
              <select
                aria-label="Filter leads by status"
                className="h-9 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pl-8 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                onChange={(event) =>
                  setStatusFilter(event.target.value as LeadStatus | "all")
                }
                value={statusFilter}
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="relative min-w-0">
              <FunnelSimpleIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
                size={16}
                weight="regular"
              />
              <select
                aria-label="Filter leads by priority"
                className="h-9 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pl-8 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                onChange={(event) =>
                  setPriorityFilter(event.target.value as LeadPriority | "all")
                }
                value={priorityFilter}
              >
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="relative min-w-0">
              <CaretDownIcon
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
                size={14}
                weight="bold"
              />
              <select
                aria-label="Filter leads by stage"
                className="h-9 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pr-8 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                onChange={(event) => setStageFilter(event.target.value)}
                value={stageFilter}
              >
                <option value="all">All stages</option>
                <option value="__none__">No stage</option>
                {stageOptions.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative min-w-0">
              <ArrowsDownUpIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
                size={16}
                weight="regular"
              />
              <select
                aria-label="Sort leads"
                className="h-9 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pl-8 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                onChange={(event) => setSortBy(event.target.value as LeadSort)}
                value={sortBy}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="value_high">Estimated value high to low</option>
                <option value="follow_up_soonest">Next follow-up soonest</option>
              </select>
            </div>

            <button
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-3.5 text-sm font-semibold text-[var(--ops-text-soft)] opacity-75"
              disabled
              title="Advanced filters will be added later."
              type="button"
            >
              <FadersHorizontalIcon aria-hidden="true" className="mr-2" size={16} weight="regular" />
              Advanced filters
            </button>

            <button
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-3.5 text-sm font-semibold text-[var(--ops-text-soft)] opacity-75"
              disabled
              title="Manage fields will be added later."
              type="button"
            >
              <SlidersHorizontalIcon aria-hidden="true" className="mr-2" size={16} weight="regular" />
              Manage fields
            </button>
          </div>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[var(--ops-text-soft)] sm:px-6">
          No leads match the current view.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--ops-card-soft)] text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                <tr>
                  <th className="px-5 py-3 sm:px-6" scope="col">
                    <input
                      aria-label="Select all leads"
                      checked={allFilteredSelected}
                      className="h-4 w-4 rounded border-[var(--ops-border)] text-[var(--workspace-primary,var(--ops-primary))] focus:ring-[var(--workspace-primary,var(--ops-primary))]"
                      onChange={toggleSelectAll}
                      type="checkbox"
                    />
                  </th>
                  <th className="px-5 py-3 sm:px-6" scope="col">
                    Lead name
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Status
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Priority
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Estimated value
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Source
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Pipeline stage
                  </th>
                  <th className="px-5 py-3" scope="col">
                    <DateTimeHeader label="Next follow-up" />
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Created
                  </th>
                  {showActions ? (
                    <th className="px-5 py-3 text-right" scope="col">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ops-border)] bg-white">
                {filteredLeads.map((lead) => (
                  <tr className="align-top" key={lead.id}>
                    <td className="px-5 py-4 sm:px-6">
                      <input
                        aria-label={`Select ${lead.title}`}
                        checked={selectedIds.includes(lead.id)}
                        className="mt-1 h-4 w-4 rounded border-[var(--ops-border)] text-[var(--workspace-primary,var(--ops-primary))] focus:ring-[var(--workspace-primary,var(--ops-primary))]"
                        onChange={() => toggleLeadSelection(lead.id)}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--workspace-primary-soft,var(--ops-primary-soft))] text-sm font-semibold text-[var(--workspace-primary,var(--ops-primary-dark))]">
                          {lead.client ? (
                            getInitials(lead)
                          ) : (
                            <UserCircleIcon aria-hidden="true" size={20} weight="duotone" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--ops-text)]">
                            {lead.title}
                          </p>
                          <div className="mt-1 space-y-1 text-xs text-[var(--ops-text-muted)]">
                            <p>{lead.client?.name ?? "No contact linked"}</p>
                            {getContactSecondaryLine(lead) ? (
                              <p>{getContactSecondaryLine(lead)}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-4">
                      <LeadPriorityBadge priority={lead.priority} />
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {formatCurrency(lead.estimated_value)}
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {lead.source ?? "Not set"}
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {lead.stage_id
                        ? stageMap.get(lead.stage_id)?.name ?? "Assigned"
                        : "No stage"}
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      <DateTimeCell value={lead.next_follow_up_at} />
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {formatCreatedDate(lead.created_at)}
                    </td>
                    {showActions ? (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {canCreateRecords ? <EditLeadDialog lead={lead} /> : null}
                          {canDeleteRecords ? (
                            <DeleteRecordButton
                              endpoint={`/api/leads/${lead.id}`}
                              label={`Delete lead ${lead.title}`}
                            />
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--ops-border)] lg:hidden">
            {filteredLeads.map((lead) => (
              <article className="space-y-4 p-5" key={lead.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--workspace-primary-soft,var(--ops-primary-soft))] text-sm font-semibold text-[var(--workspace-primary,var(--ops-primary-dark))]">
                      {lead.client ? (
                        getInitials(lead)
                      ) : (
                        <UserCircleIcon aria-hidden="true" size={20} weight="duotone" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--ops-text)]">
                        {lead.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                        {lead.client?.name ?? "No contact linked"}
                      </p>
                      {getContactSecondaryLine(lead) ? (
                        <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                          {getContactSecondaryLine(lead)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <input
                    aria-label={`Select ${lead.title}`}
                    checked={selectedIds.includes(lead.id)}
                    className="mt-1 h-4 w-4 rounded border-[var(--ops-border)] text-[var(--workspace-primary,var(--ops-primary))] focus:ring-[var(--workspace-primary,var(--ops-primary))]"
                    onChange={() => toggleLeadSelection(lead.id)}
                    type="checkbox"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <LeadStatusBadge status={lead.status} />
                  <LeadPriorityBadge priority={lead.priority} />
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                      Estimated value
                    </p>
                    <p className="mt-1 text-[var(--ops-text-soft)]">
                      {formatCurrency(lead.estimated_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                      Source
                    </p>
                    <p className="mt-1 text-[var(--ops-text-soft)]">
                      {lead.source ?? "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                      Pipeline stage
                    </p>
                    <p className="mt-1 text-[var(--ops-text-soft)]">
                      {lead.stage_id
                        ? stageMap.get(lead.stage_id)?.name ?? "Assigned"
                        : "No stage"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                      Created
                    </p>
                    <p className="mt-1 text-[var(--ops-text-soft)]">
                      {formatCreatedDate(lead.created_at)}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                      Next follow-up
                    </p>
                    <p className="mt-1 text-[var(--ops-text-soft)]">
                      <DateTimeCell value={lead.next_follow_up_at} />
                    </p>
                  </div>
                </div>

                {showActions ? (
                  <div className="flex justify-end gap-2">
                    {canCreateRecords ? <EditLeadDialog lead={lead} /> : null}
                    {canDeleteRecords ? (
                      <DeleteRecordButton
                        endpoint={`/api/leads/${lead.id}`}
                        label={`Delete lead ${lead.title}`}
                      />
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
