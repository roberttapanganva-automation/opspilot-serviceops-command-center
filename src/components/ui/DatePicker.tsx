"use client";

import * as Popover from "@radix-ui/react-popover";
import { CaretLeftIcon, CaretRightIcon, CalendarBlankIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useId, useMemo, useState } from "react";
import { DayPicker, type Matcher, DayFlag, SelectionState, UI } from "react-day-picker";

type DatePickerProps = {
  "aria-label"?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  maxDate?: Date;
  minDate?: Date;
  onChange: (value: Date | undefined) => void;
  placeholder?: string;
  showTodayAction?: boolean;
  value?: Date;
};

export function DatePicker({
  "aria-label": ariaLabel,
  clearable = false,
  disabled = false,
  error = false,
  label,
  maxDate,
  minDate,
  onChange,
  placeholder = "Select date",
  showTodayAction = true,
  value,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const fieldId = useId();
  const caption = value ? format(value, "MMM d, yyyy") : placeholder;

  const classNames = useMemo(
    () => ({
      [DayFlag.outside]: "text-[var(--ops-text-muted)] opacity-35",
      [DayFlag.today]:
        "font-semibold text-[var(--workspace-primary,var(--ops-primary-dark))]",
      [SelectionState.selected]:
        "bg-[var(--workspace-primary,var(--ops-primary))] text-white rounded-lg shadow-[0_6px_16px_var(--workspace-primary-glow,var(--ops-primary-glow))]",
      [UI.CaptionLabel]:
        "text-sm font-semibold text-[var(--ops-text)] tracking-normal text-center w-full",
      [UI.Chevron]: "h-4 w-4",
      [UI.DayButton]:
        "h-9 w-9 rounded-lg text-sm transition hover:bg-[var(--workspace-primary-soft,var(--ops-primary-soft))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--workspace-primary,var(--ops-primary))]",
      [UI.MonthCaption]: "relative flex items-center justify-center pb-3 pt-1",
      [UI.MonthGrid]: "w-full border-separate border-spacing-1",
      [UI.Nav]: "absolute inset-x-0 top-1 flex items-center justify-between px-1",
      [UI.NextMonthButton]:
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ops-border)] text-[var(--ops-text-soft)] transition hover:bg-[var(--ops-card-soft)]",
      [UI.PreviousMonthButton]:
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ops-border)] text-[var(--ops-text-soft)] transition hover:bg-[var(--ops-card-soft)]",
      [UI.Root]: "p-3",
      [UI.Weekday]:
        "h-8 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ops-text-muted)]",
    }),
    [],
  );
  const disabledDays = useMemo<Matcher[]>(
    () => [
      ...(minDate ? [{ before: minDate }] : []),
      ...(maxDate ? [{ after: maxDate }] : []),
    ],
    [maxDate, minDate],
  );

  return (
    <div>
      {label ? (
        <label
          className="text-sm font-medium text-[var(--ops-text)]"
          htmlFor={fieldId}
        >
          {label}
        </label>
      ) : null}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            aria-label={ariaLabel ?? label ?? "Choose date"}
            className={`${label ? "mt-2" : ""} flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-sm shadow-sm outline-none transition focus-visible:ring-2 ${
              error
                ? "border-[var(--ops-danger)] focus-visible:ring-[var(--ops-danger-soft)]"
                : "border-[var(--ops-border)] focus-visible:border-[var(--workspace-primary,var(--ops-primary))] focus-visible:ring-[var(--workspace-primary-glow,var(--ops-primary-glow))]"
            }`}
            disabled={disabled}
            id={fieldId}
            type="button"
          >
            <span className={value ? "text-[var(--ops-text)]" : "text-[var(--ops-text-muted)]"}>
              {caption}
            </span>
            <CalendarBlankIcon
              aria-hidden="true"
              className="text-[var(--ops-text-muted)]"
              size={18}
              weight="regular"
            />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            className="z-[80] max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--ops-border)] bg-white shadow-2xl"
            collisionPadding={16}
            sideOffset={8}
          >
            <DayPicker
              captionLayout="label"
              classNames={classNames}
              components={{
                Chevron: (props) =>
                  props.orientation === "left" ? (
                    <CaretLeftIcon aria-hidden="true" />
                  ) : (
                    <CaretRightIcon aria-hidden="true" />
                  ),
              }}
              mode="single"
              onSelect={(nextDate) => {
                onChange(nextDate);
                if (nextDate) {
                  setOpen(false);
                }
              }}
              selected={value}
              disabled={disabledDays}
            />
            {(showTodayAction || clearable) ? (
              <div className="flex items-center justify-between border-t border-[var(--ops-border)] p-3">
                {showTodayAction ? (
                  <button
                    aria-label="Choose today"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--workspace-primary,var(--ops-primary-dark))] hover:bg-[var(--workspace-primary-soft,var(--ops-primary-soft))]"
                    onClick={() => {
                      onChange(new Date());
                      setOpen(false);
                    }}
                    type="button"
                  >
                    Today
                  </button>
                ) : (
                  <span />
                )}
                {clearable ? (
                  <button
                    aria-label="Clear date"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ops-text-soft)] hover:bg-[var(--ops-card-soft)]"
                    onClick={() => {
                      onChange(undefined);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
