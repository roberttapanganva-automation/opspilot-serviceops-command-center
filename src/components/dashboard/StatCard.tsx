import { Card } from "@/components/ui/Card";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-[var(--ops-text-soft)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-[var(--ops-text)]">
        {value}
      </p>
      <p className="mt-2 text-sm text-[var(--ops-text-muted)]">{helper}</p>
    </Card>
  );
}
