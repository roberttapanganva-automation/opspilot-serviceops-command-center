import { Card } from "./Card";
import { EmptyState } from "./EmptyState";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-[var(--ops-primary-dark)]">
        OpsPilot foundation
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--ops-text)]">
        {title}
      </h2>
      <div className="mt-5">
        <EmptyState description={description} title="No data yet" />
      </div>
    </Card>
  );
}
