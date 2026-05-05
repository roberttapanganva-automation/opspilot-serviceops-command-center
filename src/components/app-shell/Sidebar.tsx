"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";
import { UserMenu } from "./UserMenu";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[260px] shrink-0 bg-[var(--ops-sidebar)] px-5 py-6 text-[var(--ops-white)] lg:flex lg:flex-col">
      <Link className="flex items-center gap-3" href="/dashboard">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ops-primary)] text-sm font-bold">
          OP
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-wide">
            OpsPilot
          </span>
          <span className="block text-xs text-white/55">Command Center</span>
        </span>
      </Link>

      <WorkspaceSwitcher />

      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Main">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.Icon;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[linear-gradient(135deg,var(--ops-primary),var(--ops-primary-dark))] text-[var(--ops-white)] shadow-[0_12px_28px_var(--ops-primary-glow)]"
                  : "text-white/70 hover:bg-white/10 hover:text-[var(--ops-white)]"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <UserMenu />
    </aside>
  );
}
