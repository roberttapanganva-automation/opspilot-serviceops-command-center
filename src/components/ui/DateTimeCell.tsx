type DateTimeCellProps = {
  emptyLabel?: string;
  value: string | null;
};

type DateTimeHeaderProps = {
  label: string;
};

function formatDatePart(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatTimePart(value: string) {
  return new Intl.DateTimeFormat("en", {
    timeStyle: "short",
  }).format(new Date(value));
}

export function DateTimeHeader({ label }: DateTimeHeaderProps) {
  return (
    <div className="min-w-[160px]">
      <span className="block">{label}</span>
      <span className="mt-1 grid grid-cols-[minmax(92px,1fr)_64px] gap-3 text-[10px] font-semibold normal-case tracking-normal text-[var(--ops-text-muted)]/70">
        <span>Date</span>
        <span>Time</span>
      </span>
    </div>
  );
}

export function DateTimeCell({
  emptyLabel = "Not scheduled",
  value,
}: DateTimeCellProps) {
  if (!value) {
    return (
      <span className="text-sm text-[var(--ops-text-muted)]">{emptyLabel}</span>
    );
  }

  return (
    <span className="grid min-w-[160px] grid-cols-[minmax(92px,1fr)_64px] gap-3 text-sm text-[var(--ops-text-soft)]">
      <span>{formatDatePart(value)}</span>
      <span className="text-[var(--ops-text-muted)]">{formatTimePart(value)}</span>
    </span>
  );
}
