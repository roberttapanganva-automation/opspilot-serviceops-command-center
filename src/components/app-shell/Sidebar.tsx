"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import {
  getWorkspaceDisplayName,
  getWorkspaceIconUrl,
  getWorkspaceLogoUrl,
} from "@/lib/branding/display";
import type { ActiveWorkspaceContext } from "@/types/domain";
import { getVisibleNavItems } from "./nav-items";
import { UserMenu } from "./UserMenu";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  workspaceContext: ActiveWorkspaceContext;
};

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  workspaceContext,
}: SidebarProps) {
  const pathname = usePathname();
  const appName = getWorkspaceDisplayName({
    branding: workspaceContext.branding,
    workspaceName: workspaceContext.workspace.name,
  });
  const collapsedAssetUrl = getWorkspaceIconUrl({
    branding: workspaceContext.branding,
    workspaceName: workspaceContext.workspace.name,
  });
  const expandedAssetUrl =
    getWorkspaceLogoUrl({
      branding: workspaceContext.branding,
      workspaceName: workspaceContext.workspace.name,
    }) ?? collapsedAssetUrl;
  const visibleNavItems = getVisibleNavItems(workspaceContext);
  const ToggleIcon = collapsed ? CaretRightIcon : CaretLeftIcon;

  return (
    <aside
      className={`fixed inset-y-0 left-0 hidden shrink-0 bg-[var(--ops-sidebar)] px-5 py-6 text-[var(--ops-white)] transition-[width] duration-300 ease-out lg:flex lg:flex-col ${
        collapsed ? "w-[84px]" : "w-[260px]"
      }`}
    >
      <Link
        className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""} min-w-0`}
        href="/dashboard"
      >
        {collapsed ? (
          <span
            aria-label={appName}
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[var(--ops-sidebar-card)] text-sm font-bold shadow-[0_8px_24px_var(--ops-primary-glow)]"
            title={appName}
          >
            {collapsedAssetUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={`${appName} icon`}
                className="h-full w-full object-contain"
                src={collapsedAssetUrl}
              />
            ) : (
              "OP"
            )}
          </span>
        ) : (
          <span className="min-w-0 flex-1">
            <span className="flex h-16 w-full items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[var(--ops-sidebar-card)] px-3 shadow-[0_8px_24px_var(--ops-primary-glow)]">
              {expandedAssetUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${appName} logo`}
                  className="h-full max-h-14 w-full object-contain object-center"
                  src={expandedAssetUrl}
                />
              ) : (
                <span className="truncate text-sm font-semibold tracking-wide">
                  {appName}
                </span>
              )}
            </span>
            <span className="mt-1 block text-center text-xs text-white/55">
              Command Center
            </span>
          </span>
        )}
      </Link>

      {!collapsed && workspaceContext.role === "owner" ? (
        <WorkspaceSwitcher workspaceContext={workspaceContext} />
      ) : null}

      <nav
        className={`flex flex-1 flex-col gap-1 ${collapsed ? "mt-8" : "mt-8"}`}
        aria-label="Main"
      >
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.Icon;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[linear-gradient(135deg,var(--ops-primary),var(--ops-primary-dark))] text-[var(--ops-white)] shadow-[0_12px_28px_var(--ops-primary-glow)]"
                  : "text-white/70 hover:bg-white/10 hover:text-[var(--ops-white)]"
              } ${collapsed ? "justify-center px-2" : "px-3"}`}
              href={item.href}
              key={item.href}
              title={collapsed ? item.label : undefined}
            >
              <Icon aria-hidden="true" size={20} weight="duotone" />
              <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {collapsed ? (
        <div className="mb-4 flex justify-center">
          <button
            aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-[var(--ops-primary)] text-white shadow-[0_10px_24px_var(--ops-primary-glow)] transition hover:bg-[var(--ops-primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
            onClick={onToggleCollapsed}
            type="button"
          >
            <ToggleIcon aria-hidden="true" size={20} weight="regular" />
          </button>
        </div>
      ) : (
        <div className="relative mt-2">
          <UserMenu />
          <button
            aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
            className="absolute right-[-14px] top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[var(--ops-primary)] text-white shadow-[0_10px_24px_var(--ops-primary-glow)] transition hover:bg-[var(--ops-primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
            onClick={onToggleCollapsed}
            type="button"
          >
            <ToggleIcon aria-hidden="true" size={20} weight="regular" />
          </button>
        </div>
      )}
    </aside>
  );
}
