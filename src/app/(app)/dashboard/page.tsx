import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";

const stats = [
  {
    label: "New Leads",
    value: "No data",
    helper: "Connect Supabase before showing metrics.",
  },
  {
    label: "Jobs Booked",
    value: "No data",
    helper: "Real job counts arrive after CRUD.",
  },
  {
    label: "Revenue (Est.)",
    value: "No data",
    helper: "Estimated revenue will use workspace data.",
  },
  {
    label: "Overdue Tasks",
    value: "No data",
    helper: "Overdue status will be calculated dynamically.",
  },
];

const dashboardSections = [
  {
    title: "Pipeline Overview",
    description: "Lead and job stages will render here after database setup.",
  },
  {
    title: "Today's Agenda",
    description: "Appointments and scheduled jobs will appear here.",
  },
  {
    title: "Tasks Overview",
    description: "Task status summaries will use real workspace tasks.",
  },
  {
    title: "Revenue Overview",
    description: "Estimated revenue remains empty until jobs exist.",
  },
  {
    title: "Recent Activity",
    description: "Automation and audit logs will appear after logging exists.",
  },
  {
    title: "AI Assistant",
    description: "AI is intentionally only a placeholder in this phase.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--ops-border)] bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-[var(--ops-primary-dark)]">
          What needs attention today?
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--ops-text)]">
          Welcome to OpsPilot
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ops-text-soft)]">
          This is the initial App Router foundation. Workspace loading,
          Supabase data, and real dashboard metrics come in later phases.
        </p>
      </section>

      <section
        aria-label="Dashboard metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {dashboardSections.map((section) => (
          <Card className="p-5" key={section.title}>
            <SectionHeader title={section.title} />
            <div className="mt-4">
              <EmptyState
                description={section.description}
                title="No workspace data yet"
              />
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
