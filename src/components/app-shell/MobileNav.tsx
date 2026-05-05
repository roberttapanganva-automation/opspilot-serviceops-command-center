"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

const mobileItems = navItems.slice(0, 5);

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--ops-border)] bg-white/95 px-2 py-2 backdrop-blur lg:hidden"
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
              <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
