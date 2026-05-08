"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ActiveWorkspaceContext } from "@/types/domain";
import { getVisibleNavItems } from "./nav-items";

type MobileNavProps = {
  workspaceContext: ActiveWorkspaceContext;
};

export function MobileNav({ workspaceContext }: MobileNavProps) {
  const pathname = usePathname();
  const visibleItems = getVisibleNavItems(workspaceContext);
  const ownerItem = visibleItems.find((item) => item.href === "/owner");
  const mobileItems = ownerItem
    ? [...visibleItems.filter((item) => item.href !== "/owner").slice(0, 4), ownerItem]
    : visibleItems.slice(0, 5);

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--ops-border)] bg-[var(--ops-card)]/95 px-2 py-2 backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.Icon;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-[11px] font-semibold transition ${
                isActive
                  ? "bg-[var(--ops-primary-soft)] text-[var(--ops-primary-dark)]"
                  : "text-[var(--ops-text-soft)]"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" size={22} weight="duotone" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
