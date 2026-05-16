"use client";

import {
  AddressBookIcon,
  ArrowsDownUpIcon,
  DotsThreeOutlineVerticalIcon,
  DownloadSimpleIcon,
  FadersHorizontalIcon,
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { ClientListItem } from "@/types/domain";
import { AddContactDialog } from "./AddContactDialog";

type ContactsPanelProps = {
  canCreateRecords: boolean;
  clients: ClientListItem[];
};

type ContactView = "all" | "customers" | "repeat" | "saved";
type ContactSort = "newest" | "name" | "activity";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatLastActivity(value: string | null) {
  if (!value) {
    return "No activity yet";
  }

  return formatDate(value);
}

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "C";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function getTypeTags(client: ClientListItem) {
  const tags: string[] = [client.relationship_label];

  if (client.linked_lead_count > 0) {
    tags.push("Lead-linked");
  }

  return tags;
}

function compareByActivity(left: ClientListItem, right: ClientListItem) {
  const leftTimestamp = left.last_activity_at
    ? new Date(left.last_activity_at).getTime()
    : 0;
  const rightTimestamp = right.last_activity_at
    ? new Date(right.last_activity_at).getTime()
    : 0;

  if (rightTimestamp !== leftTimestamp) {
    return rightTimestamp - leftTimestamp;
  }

  return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
}

export function ContactsPanel({
  canCreateRecords,
  clients,
}: ContactsPanelProps) {
  const [activeView, setActiveView] = useState<ContactView>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ContactSort>("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const counts = useMemo(
    () => ({
      all: clients.length,
      customers: clients.filter((client) => client.relationship_label === "Customer")
        .length,
      repeat: clients.filter(
        (client) => client.relationship_label === "Repeat customer",
      ).length,
      saved: clients.filter((client) => client.relationship_label === "Saved contact")
        .length,
    }),
    [clients],
  );

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let nextClients = clients.filter((client) => {
      if (activeView === "customers") {
        return client.relationship_label === "Customer";
      }

      if (activeView === "repeat") {
        return client.relationship_label === "Repeat customer";
      }

      if (activeView === "saved") {
        return client.relationship_label === "Saved contact";
      }

      return true;
    });

    if (query) {
      nextClients = nextClients.filter((client) =>
        [
          client.name,
          client.email,
          client.phone,
          client.company_name,
          client.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    const sortedClients = [...nextClients];

    if (sortBy === "name") {
      sortedClients.sort((left, right) => left.name.localeCompare(right.name));
    } else if (sortBy === "activity") {
      sortedClients.sort(compareByActivity);
    } else {
      sortedClients.sort(
        (left, right) =>
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      );
    }

    return sortedClients;
  }, [activeView, clients, searchQuery, sortBy]);

  const allFilteredSelected =
    filteredClients.length > 0 &&
    filteredClients.every((client) => selectedIds.includes(client.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds((current) =>
        current.filter(
          (selectedId) =>
            !filteredClients.some((client) => client.id === selectedId),
        ),
      );
      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...filteredClients.map((client) => client.id)]),
    ]);
  }

  function toggleClientSelection(clientId: string) {
    setSelectedIds((current) =>
      current.includes(clientId)
        ? current.filter((selectedId) => selectedId !== clientId)
        : [...current, clientId],
    );
  }

  const viewOptions: Array<{
    count: number;
    key: ContactView;
    label: string;
  }> = [
    { count: counts.all, key: "all", label: "All" },
    { count: counts.customers, key: "customers", label: "Customers" },
    { count: counts.repeat, key: "repeat", label: "Repeat Customers" },
    { count: counts.saved, key: "saved", label: "Saved Contacts" },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--ops-border)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-[var(--ops-text)]">
                Contacts
              </h2>
              <span className="inline-flex items-center rounded-full bg-[var(--ops-card-soft)] px-3 py-1 text-sm font-semibold text-[var(--ops-text-soft)]">
                {counts.all} {counts.all === 1 ? "Contact" : "Contacts"}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ops-text-soft)]">
              Customers and repeat clients connected to completed work or manually
              saved records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-4 text-sm font-semibold text-[var(--ops-text-soft)] opacity-75"
              disabled
              title="Import contacts will be added later."
              type="button"
            >
              <DownloadSimpleIcon aria-hidden="true" className="mr-2" size={18} weight="regular" />
              Import
            </button>
            {canCreateRecords ? <AddContactDialog /> : null}
            <button
              aria-label="More contact actions"
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
            <button
              className="inline-flex h-9 items-center rounded-full border border-dashed border-[var(--ops-border)] px-3 text-sm font-semibold text-[var(--ops-text-muted)] opacity-75"
              disabled
              title="Smart lists will be added later."
              type="button"
            >
              + Add smart list
            </button>
          </div>

          <div className="grid gap-3 xl:grid-cols-[auto_auto_minmax(240px,1fr)_180px_auto]">
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-4 text-sm font-semibold text-[var(--ops-text-soft)] opacity-75"
              disabled
              title="Advanced filters will be added later."
              type="button"
            >
              <FadersHorizontalIcon aria-hidden="true" className="mr-2" size={18} weight="regular" />
              Advanced filters
            </button>

            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-4 text-sm font-semibold text-[var(--ops-text-soft)] opacity-75"
              disabled
              title="Manage fields will be added later."
              type="button"
            >
              <SlidersHorizontalIcon aria-hidden="true" className="mr-2" size={18} weight="regular" />
              Manage fields
            </button>

            <div className="relative min-w-0">
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
                size={18}
                weight="regular"
              />
              <input
                aria-label="Search contacts"
                className="h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pl-9 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search contacts"
                type="search"
                value={searchQuery}
              />
            </div>

            <div className="relative min-w-0">
              <ArrowsDownUpIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ops-text-muted)]"
                size={18}
                weight="regular"
              />
              <select
                aria-label="Sort contacts"
                className="h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 pl-9 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--workspace-primary,var(--ops-primary))] focus:ring-2 focus:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
                onChange={(event) => setSortBy(event.target.value as ContactSort)}
                value={sortBy}
              >
                <option value="newest">Newest first</option>
                <option value="name">Name A-Z</option>
                <option value="activity">Latest activity</option>
              </select>
            </div>

            <div className="flex items-center justify-end text-sm text-[var(--ops-text-muted)]">
              {filteredClients.length} shown
            </div>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="px-5 py-10 sm:px-6">
          <div className="rounded-xl border border-dashed border-[var(--ops-border)] bg-[var(--ops-card-soft)] px-6 py-10 text-center">
            <p className="text-base font-semibold text-[var(--ops-text)]">
              No contacts yet.
            </p>
            <p className="mt-2 text-sm text-[var(--ops-text-soft)]">
              Customers will appear here after jobs are completed or when you add
              a contact manually.
            </p>
            {canCreateRecords ? (
              <div className="mt-5 flex justify-center">
                <AddContactDialog />
              </div>
            ) : null}
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[var(--ops-text-soft)] sm:px-6">
          No contacts match the current view.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--ops-card-soft)] text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                <tr>
                  <th className="px-5 py-3 sm:px-6" scope="col">
                    <input
                      aria-label="Select all contacts"
                      checked={allFilteredSelected}
                      className="h-4 w-4 rounded border-[var(--ops-border)] text-[var(--workspace-primary,var(--ops-primary))] focus:ring-[var(--workspace-primary,var(--ops-primary))]"
                      onChange={toggleSelectAll}
                      type="checkbox"
                    />
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Contact name
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Phone
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Email
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Business name
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Created
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Last activity
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Type / Tags
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ops-border)] bg-white">
                {filteredClients.map((client) => (
                  <tr className="align-top" key={client.id}>
                    <td className="px-5 py-4 sm:px-6">
                      <input
                        aria-label={`Select ${client.name}`}
                        checked={selectedIds.includes(client.id)}
                        className="mt-1 h-4 w-4 rounded border-[var(--ops-border)] text-[var(--workspace-primary,var(--ops-primary))] focus:ring-[var(--workspace-primary,var(--ops-primary))]"
                        onChange={() => toggleClientSelection(client.id)}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--workspace-primary-soft,var(--ops-primary-soft))] text-sm font-semibold text-[var(--workspace-primary,var(--ops-primary-dark))]">
                          {getInitials(client.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--ops-text)]">{client.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--ops-text-muted)]">
                            <AddressBookIcon aria-hidden="true" size={13} weight="regular" />
                            <span>{client.linked_lead_count} linked leads</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {client.phone ?? "Not set"}
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {client.email ?? "Not set"}
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {client.company_name ?? "Not set"}
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                      {formatLastActivity(client.last_activity_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {getTypeTags(client).map((tag) => (
                          <span
                            className="inline-flex items-center rounded-full bg-[var(--ops-card-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ops-text-soft)]"
                            key={`${client.id}-${tag}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--ops-border)] lg:hidden">
            {filteredClients.map((client) => (
              <article className="space-y-4 p-5" key={client.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--workspace-primary-soft,var(--ops-primary-soft))] text-sm font-semibold text-[var(--workspace-primary,var(--ops-primary-dark))]">
                      {getInitials(client.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--ops-text)]">{client.name}</p>
                      <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                        {client.email ?? "No email"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                        {client.phone ?? "No phone"}
                      </p>
                    </div>
                  </div>
                  <input
                    aria-label={`Select ${client.name}`}
                    checked={selectedIds.includes(client.id)}
                    className="mt-1 h-4 w-4 rounded border-[var(--ops-border)] text-[var(--workspace-primary,var(--ops-primary))] focus:ring-[var(--workspace-primary,var(--ops-primary))]"
                    onChange={() => toggleClientSelection(client.id)}
                    type="checkbox"
                  />
                </div>

                <div className="grid gap-3 text-sm text-[var(--ops-text-soft)]">
                  <div className="flex justify-between gap-4">
                    <span>Business</span>
                    <span className="text-right text-[var(--ops-text)]">
                      {client.company_name ?? "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Created</span>
                    <span className="text-right text-[var(--ops-text)]">
                      {formatDate(client.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Last activity</span>
                    <span className="text-right text-[var(--ops-text)]">
                      {formatLastActivity(client.last_activity_at)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {getTypeTags(client).map((tag) => (
                    <span
                      className="inline-flex items-center rounded-full bg-[var(--ops-card-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ops-text-soft)]"
                      key={`${client.id}-mobile-${tag}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
