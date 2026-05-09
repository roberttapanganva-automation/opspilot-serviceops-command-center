"use client";

import { XIcon, PlusIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import type { ApiResponse } from "@/types/api";

type AddLeadDialogProps = {
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

type CreatedLead = {
  id: string;
};

function getErrorMessage(response: ApiResponse<CreatedLead>) {
  if (response.ok) {
    return null;
  }

  return response.error.message;
}

export function AddLeadDialog({
  className = "",
  variant = "primary",
}: AddLeadDialogProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>(
    undefined,
  );

  function closeDialog() {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setNextFollowUpDate(undefined);
    setIsOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const nextFollowUpDateValue = nextFollowUpDate
      ? `${nextFollowUpDate.getFullYear()}-${String(nextFollowUpDate.getMonth() + 1).padStart(2, "0")}-${String(nextFollowUpDate.getDate()).padStart(2, "0")}`
      : "";
    const nextFollowUpTime = String(formData.get("next_follow_up_time") ?? "");
    const estimatedValue = String(formData.get("estimated_value") ?? "");
    const nextFollowUp =
      nextFollowUpDateValue && nextFollowUpTime
        ? `${nextFollowUpDateValue}T${nextFollowUpTime}`
        : "";

    const payload = {
      client_email: String(formData.get("client_email") ?? ""),
      client_name: String(formData.get("client_name") ?? ""),
      client_phone: String(formData.get("client_phone") ?? ""),
      estimated_value: estimatedValue ? Number(estimatedValue) : undefined,
      next_follow_up_at: nextFollowUp
        ? new Date(nextFollowUp).toISOString()
        : undefined,
      notes: String(formData.get("notes") ?? ""),
      priority: String(formData.get("priority") ?? "normal"),
      source: String(formData.get("source") ?? ""),
      status: "open",
      title: String(formData.get("title") ?? ""),
    };

    try {
      const response = await fetch("/api/leads", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as ApiResponse<CreatedLead>;
      const message = getErrorMessage(result);

      if (!response.ok || message) {
        setError(message ?? "We could not create the lead. Please try again.");
        return;
      }

      formRef.current?.reset();
      setNextFollowUpDate(undefined);
      setIsOpen(false);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not create the lead. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button
        className={`gap-2 ${className}`}
        onClick={() => setIsOpen(true)}
        type="button"
        variant={variant}
      >
        <PlusIcon aria-hidden="true" size={20} weight="regular" />
        Add Lead
      </Button>

      {isOpen ? (
        <div
          aria-labelledby="add-lead-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--ops-border)] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--ops-border)] px-5 py-4 sm:px-6">
              <div>
                <h2
                  className="text-lg font-semibold text-[var(--ops-text)]"
                  id="add-lead-title"
                >
                  Add Lead
                </h2>
                <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
                  Create a lead for the active workspace.
                </p>
              </div>
              <button
                aria-label="Close add lead dialog"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--ops-text-soft)] transition hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
                disabled={isSubmitting}
                onClick={closeDialog}
                type="button"
              >
                <XIcon aria-hidden="true" size={20} weight="regular" />
              </button>
            </div>

            <form className="space-y-5 p-5 sm:p-6" onSubmit={handleSubmit} ref={formRef}>
              {error ? (
                <div
                  className="rounded-lg border border-[var(--ops-danger-soft)] bg-[var(--ops-danger-soft)] p-3 text-sm leading-6 text-[var(--ops-danger)]"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <div>
                <label
                  className="text-sm font-medium text-[var(--ops-text)]"
                  htmlFor="lead-title"
                >
                  Lead title <span className="text-[var(--ops-danger)]">*</span>
                </label>
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                  disabled={isSubmitting}
                  id="lead-title"
                  name="title"
                  placeholder="New service inquiry"
                  required
                  type="text"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="text-sm font-medium text-[var(--ops-text)]"
                    htmlFor="lead-client-name"
                  >
                    Contact name
                  </label>
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                    disabled={isSubmitting}
                    id="lead-client-name"
                    name="client_name"
                    placeholder="Client name"
                    type="text"
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-[var(--ops-text)]"
                    htmlFor="lead-client-email"
                  >
                    Email
                  </label>
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                    disabled={isSubmitting}
                    id="lead-client-email"
                    name="client_email"
                    placeholder="client@example.com"
                    type="email"
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-[var(--ops-text)]"
                    htmlFor="lead-client-phone"
                  >
                    Phone
                  </label>
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                    disabled={isSubmitting}
                    id="lead-client-phone"
                    name="client_phone"
                    placeholder="Phone number"
                    type="tel"
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-[var(--ops-text)]"
                    htmlFor="lead-source"
                  >
                    Source
                  </label>
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                    disabled={isSubmitting}
                    id="lead-source"
                    name="source"
                    placeholder="manual"
                    type="text"
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-[var(--ops-text)]"
                    htmlFor="lead-estimated-value"
                  >
                    Estimated value
                  </label>
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                    disabled={isSubmitting}
                    id="lead-estimated-value"
                    min="0"
                    name="estimated_value"
                    placeholder="0"
                    step="0.01"
                    type="number"
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-[var(--ops-text)]"
                    htmlFor="lead-priority"
                  >
                    Priority
                  </label>
                  <select
                    className="mt-2 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                    defaultValue="normal"
                    disabled={isSubmitting}
                    id="lead-priority"
                    name="priority"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    className="text-sm font-medium text-[var(--ops-text)]"
                    htmlFor="lead-next-follow-up-date"
                  >
                    Next follow-up
                  </label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                    <div>
                      <label
                        className="text-[11px] font-semibold uppercase tracking-normal text-[var(--ops-text-muted)]"
                        htmlFor="lead-next-follow-up-date-hidden"
                      >
                        Date
                      </label>
                      <input
                        id="lead-next-follow-up-date-hidden"
                        name="next_follow_up_date"
                        readOnly
                        type="hidden"
                        value={
                          nextFollowUpDate
                            ? `${nextFollowUpDate.getFullYear()}-${String(nextFollowUpDate.getMonth() + 1).padStart(2, "0")}-${String(nextFollowUpDate.getDate()).padStart(2, "0")}`
                            : ""
                        }
                      />
                      <DatePicker
                        aria-label="Next follow-up date"
                        clearable
                        disabled={isSubmitting}
                        onChange={setNextFollowUpDate}
                        showTodayAction
                        value={nextFollowUpDate}
                      />
                    </div>
                    <div>
                      <label
                        className="text-[11px] font-semibold uppercase tracking-normal text-[var(--ops-text-muted)]"
                        htmlFor="lead-next-follow-up-time"
                      >
                        Time
                      </label>
                      <input
                        className="mt-1 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                        disabled={isSubmitting}
                        id="lead-next-follow-up-time"
                        name="next_follow_up_time"
                        step="900"
                        type="time"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="text-sm font-medium text-[var(--ops-text)]"
                  htmlFor="lead-notes"
                >
                  Notes
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-lg border border-[var(--ops-border)] bg-white px-3 py-2 text-sm text-[var(--ops-text)] shadow-sm outline-none transition placeholder:text-[var(--ops-text-muted)] focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)]"
                  disabled={isSubmitting}
                  id="lead-notes"
                  name="notes"
                  placeholder="Add qualification notes or next steps."
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--ops-border)] pt-5 sm:flex-row sm:justify-end">
                <Button
                  disabled={isSubmitting}
                  onClick={closeDialog}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Creating..." : "Create lead"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
