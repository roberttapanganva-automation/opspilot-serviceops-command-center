type SectionHeaderProps = {
  title: string;
  description?: string;
};

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[var(--ops-text)]">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-[var(--ops-text-soft)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
