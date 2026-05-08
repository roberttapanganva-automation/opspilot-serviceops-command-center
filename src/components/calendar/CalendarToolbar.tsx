import { Card } from "@/components/ui/Card";

const filters = ["Today", "Upcoming", "Completed"];

export function CalendarToolbar() {
  return (
    <Card className="p-2">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <button
            className={`h-9 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)] ${
              index === 1
                ? "bg-[var(--ops-primary)] text-white shadow-[0_10px_24px_var(--ops-primary-glow)]"
                : "text-[var(--ops-text-soft)] hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)]"
            }`}
            key={filter}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>
    </Card>
  );
}
