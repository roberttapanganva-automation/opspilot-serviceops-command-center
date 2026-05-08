import { Card } from "@/components/ui/Card";
import {
  AppointmentStatusBadge,
  type AppointmentStatus,
} from "./AppointmentStatusBadge";
import { CalendarEmptyState } from "./CalendarEmptyState";

export type AppointmentListItem = {
  client: {
    email: string | null;
    name: string;
  } | null;
  client_id: string | null;
  created_at: string;
  ends_at: string | null;
  id: string;
  job_id: string | null;
  location: string | null;
  notes: string | null;
  starts_at: string;
  status: AppointmentStatus;
  title: string;
};

type CalendarListProps = {
  appointments: AppointmentListItem[];
  canCreateRecords: boolean;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatClient(appointment: AppointmentListItem) {
  if (!appointment.client) {
    return "No client linked";
  }

  if (!appointment.client.email) {
    return appointment.client.name;
  }

  return `${appointment.client.name} - ${appointment.client.email}`;
}

export function CalendarList({
  appointments,
  canCreateRecords,
}: CalendarListProps) {
  if (appointments.length === 0) {
    return <CalendarEmptyState canCreateRecords={canCreateRecords} />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--ops-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--ops-text)]">
          Appointment list
        </h2>
        <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
          Appointments are loaded from the active workspace.
        </p>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--ops-card-soft)] text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
            <tr>
              <th className="px-5 py-3 sm:px-6" scope="col">
                Appointment
              </th>
              <th className="px-5 py-3" scope="col">
                Status
              </th>
              <th className="px-5 py-3" scope="col">
                Starts
              </th>
              <th className="px-5 py-3" scope="col">
                Ends
              </th>
              <th className="px-5 py-3" scope="col">
                Location
              </th>
              <th className="px-5 py-3" scope="col">
                Client
              </th>
              <th className="px-5 py-3" scope="col">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--ops-border)] bg-white">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-5 py-4 sm:px-6">
                  <p className="font-medium text-[var(--ops-text)]">
                    {appointment.title}
                  </p>
                  <p className="mt-1 max-w-xs truncate text-xs text-[var(--ops-text-muted)]">
                    {appointment.notes ?? "No notes added"}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <AppointmentStatusBadge status={appointment.status} />
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {formatDateTime(appointment.starts_at)}
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {appointment.ends_at
                    ? formatDateTime(appointment.ends_at)
                    : "Not set"}
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {appointment.location ?? "Not set"}
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {formatClient(appointment)}
                </td>
                <td className="px-5 py-4 text-[var(--ops-text-soft)]">
                  {formatCreatedDate(appointment.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[var(--ops-border)] xl:hidden">
        {appointments.map((appointment) => (
          <article className="p-5" key={appointment.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold text-[var(--ops-text)]">
                  {appointment.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                  {formatDateTime(appointment.starts_at)}
                </p>
              </div>
              <AppointmentStatusBadge status={appointment.status} />
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Ends
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {appointment.ends_at
                    ? formatDateTime(appointment.ends_at)
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Location
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {appointment.location ?? "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Client
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {formatClient(appointment)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
                  Created
                </p>
                <p className="mt-1 text-[var(--ops-text-soft)]">
                  {formatCreatedDate(appointment.created_at)}
                </p>
              </div>
            </div>

            {appointment.notes ? (
              <p className="mt-4 rounded-lg bg-[var(--ops-card-soft)] p-3 text-sm leading-6 text-[var(--ops-text-soft)]">
                {appointment.notes}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </Card>
  );
}
