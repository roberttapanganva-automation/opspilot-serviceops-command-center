import { Bell, MessageSquare, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserMenu } from "./UserMenu";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--ops-border)] bg-[var(--ops-main-bg)]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ops-text-muted)]">
            ServiceOps Command Center
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--ops-text)]">
            OpsPilot
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            id="global-search"
            icon={<Search aria-hidden="true" className="h-4 w-4" />}
            label="Search anything"
            placeholder="Search anything..."
            type="search"
          />
          <Button className="gap-2">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add New
          </Button>
          <div className="flex items-center gap-2" aria-label="Account tools">
            <button
              aria-label="Messages"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white text-[var(--ops-text-soft)] shadow-sm transition hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
              type="button"
            >
              <MessageSquare aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              aria-label="Notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white text-[var(--ops-text-soft)] shadow-sm transition hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
              type="button"
            >
              <Bell aria-hidden="true" className="h-4 w-4" />
            </button>
            <div className="hidden sm:block">
              <UserMenu compact />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
