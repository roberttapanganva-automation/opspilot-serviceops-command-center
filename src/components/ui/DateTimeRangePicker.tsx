"use client";

import { useId, useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";

export type DateTimeRangeValue = {
  end: string | null;
  start: string | null;
};

type DateTimeRangePickerProps = {
  disabled?: boolean;
  error?: string | null;
  label: string;
  onChange: (value: DateTimeRangeValue) => void;
  requiredEnd?: boolean;
  requiredStart?: boolean;
  value: DateTimeRangeValue;
};

type DurationPreset = 30 | 60 | 120 | "custom";

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

function formatTimeLabel(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hours = Number(hourText);
  const minutes = Number(minuteText);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getDateParts(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    date,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`,
  };
}

function buildLocalIso(date: Date, time: string) {
  const [hourText, minuteText] = time.split(":");
  const nextDate = new Date(date);
  nextDate.setHours(Number(hourText), Number(minuteText), 0, 0);

  return nextDate.toISOString();
}

function addMinutesIso(value: string, minutes: number) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);

  return date.toISOString();
}

export function getDateTimeRangeError(
  value: DateTimeRangeValue,
  options: { requiredEnd?: boolean; requiredStart?: boolean },
) {
  if (options.requiredStart && !value.start) {
    return "Start date and time is required.";
  }

  if (options.requiredEnd && !value.end) {
    return "End date and time is required.";
  }

  if (value.end && !value.start) {
    return "Start date and time is required when end time is set.";
  }

  if (value.start && value.end) {
    const startTime = new Date(value.start).getTime();
    const endTime = new Date(value.end).getTime();

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      return "Choose a valid date and time.";
    }

    if (endTime <= startTime) {
      return "End time must be after start time.";
    }
  }

  return null;
}

export function DateTimeRangePicker({
  disabled = false,
  error,
  label,
  onChange,
  requiredEnd = false,
  requiredStart = false,
  value,
}: DateTimeRangePickerProps) {
  const fieldId = useId();
  const [duration, setDuration] = useState<DurationPreset>("custom");
  const startParts = getDateParts(value.start);
  const endParts = getDateParts(value.end);
  const selectedDate = startParts?.date ?? endParts?.date ?? undefined;
  const startTime = startParts?.time ?? "";
  const endTime = endParts?.time ?? "";
  const validationError =
    error ?? getDateTimeRangeError(value, { requiredEnd, requiredStart });
  const errorId = `${fieldId}-error`;

  function updateStart(nextStart: string | null) {
    const nextValue = { ...value, start: nextStart };

    if (nextStart && duration !== "custom") {
      nextValue.end = addMinutesIso(nextStart, duration);
    }

    onChange(nextValue);
  }

  function handleDateSelect(date: Date | undefined) {
    if (!date) {
      setDuration("custom");
      onChange({ end: null, start: null });
      return;
    }

    const nextStartTime = startTime || "09:00";
    const nextStart = buildLocalIso(date, nextStartTime);
    const nextEnd =
      duration === "custom" ? value.end : addMinutesIso(nextStart, duration);

    onChange({
      end: nextEnd,
      start: nextStart,
    });
  }

  function handleStartTimeChange(nextTime: string) {
    const date = selectedDate ?? new Date();
    updateStart(buildLocalIso(date, nextTime));
  }

  function handleEndTimeChange(nextTime: string) {
    const date = selectedDate ?? new Date();
    setDuration("custom");
    onChange({
      ...value,
      end: buildLocalIso(date, nextTime),
    });
  }

  function applyDuration(nextDuration: DurationPreset) {
    setDuration(nextDuration);

    if (nextDuration === "custom" || !value.start) {
      return;
    }

    onChange({
      ...value,
      end: addMinutesIso(value.start, nextDuration),
    });
  }

  function clearRange() {
    setDuration("custom");
    onChange({ end: null, start: null });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-[var(--ops-text)]">
          {label}{" "}
          {requiredStart ? (
            <span className="text-[var(--ops-danger)]">*</span>
          ) : null}
        </label>
        {!requiredStart && !requiredEnd ? (
          <button
            className="text-xs font-semibold text-[var(--ops-text-muted)] transition hover:text-[var(--ops-text)]"
            disabled={disabled}
            onClick={clearRange}
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div
        aria-describedby={validationError ? errorId : undefined}
        className="mt-2 rounded-xl border border-[var(--ops-border)] bg-[var(--ops-card-soft)] p-3"
      >
        <DatePicker
          aria-label={`${label} date`}
          clearable={!requiredStart && !requiredEnd}
          disabled={disabled}
          error={Boolean(validationError)}
          onChange={handleDateSelect}
          placeholder="Select date"
          showTodayAction
          value={selectedDate}
        />

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]"
              htmlFor={`${fieldId}-start`}
            >
              Start time
            </label>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              id={`${fieldId}-start`}
              onChange={(event) => handleStartTimeChange(event.target.value)}
              value={startTime}
            >
              <option value="">Select start</option>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {formatTimeLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]"
              htmlFor={`${fieldId}-end`}
            >
              End time
            </label>
            <select
              className="mt-1 h-10 w-full rounded-lg border border-[var(--ops-border)] bg-[var(--ops-card)] px-3 text-sm text-[var(--ops-text)] shadow-sm outline-none transition focus:border-[var(--ops-primary)] focus:ring-2 focus:ring-[var(--ops-primary-glow)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              id={`${fieldId}-end`}
              onChange={(event) => handleEndTimeChange(event.target.value)}
              value={endTime}
            >
              <option value="">Select end</option>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {formatTimeLabel(option)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase text-[var(--ops-text-muted)]">
            Quick duration
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: "30 min", value: 30 },
              { label: "1 hour", value: 60 },
              { label: "2 hours", value: 120 },
              { label: "Custom", value: "custom" },
            ].map((option) => (
              <button
                className={`h-9 rounded-lg border px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)] ${
                  duration === option.value
                    ? "border-[var(--ops-primary)] bg-[var(--ops-primary)] text-white"
                    : "border-[var(--ops-border)] bg-[var(--ops-card)] text-[var(--ops-text-soft)] hover:bg-[var(--ops-card-soft)]"
                }`}
                disabled={disabled}
                key={option.label}
                onClick={() => applyDuration(option.value as DurationPreset)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {validationError ? (
          <p className="mt-3 text-sm text-[var(--ops-danger)]" id={errorId}>
            {validationError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
