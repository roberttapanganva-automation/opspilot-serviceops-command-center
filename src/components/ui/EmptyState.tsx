type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--ops-border-strong)] bg-[var(--ops-card-soft)] p-6 text-center">
      <p className="text-sm font-semibold text-[var(--ops-text)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--ops-text-soft)]">
        {description}
      </p>
    </div>
  );
}
