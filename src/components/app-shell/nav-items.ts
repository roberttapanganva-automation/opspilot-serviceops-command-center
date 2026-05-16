import {
  BriefcaseIcon,
  CalendarBlankIcon,
  CheckSquareIcon,
  RowsIcon,
  GearSixIcon,
  CrownIcon,
  RobotIcon,
  SquaresFourIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import {
  canAccessOwnerConsole,
  canManageWorkspaceSettings,
} from "@/lib/permissions/workspace";
import type { ActiveWorkspaceContext } from "@/types/domain";

const navItems = [
  { href: "/dashboard", label: "Overview", Icon: SquaresFourIcon },
  {
    href: "/leads",
    label: "CRM",
    Icon: UsersThreeIcon,
    moduleKey: "leads_enabled",
  },
  {
    href: "/jobs",
    label: "Jobs",
    Icon: BriefcaseIcon,
    moduleKey: "jobs_enabled",
  },
  {
    href: "/tasks",
    label: "Tasks",
    Icon: CheckSquareIcon,
    moduleKey: "tasks_enabled",
  },
  {
    href: "/calendar",
    label: "Calendar",
    Icon: CalendarBlankIcon,
    moduleKey: "calendar_enabled",
  },
  {
    href: "/pipelines",
    label: "Pipelines",
    Icon: RowsIcon,
  },
  {
    href: "/automations",
    label: "Automations",
    Icon: RobotIcon,
    moduleKey: "automations_enabled",
  },
  {
    href: "/settings",
    label: "Settings",
    Icon: GearSixIcon,
    settingsOnly: true,
  },
  {
    href: "/owner",
    label: "Owner Console",
    Icon: CrownIcon,
    ownerOnly: true,
  },
] as const;

export function getVisibleNavItems(workspaceContext: ActiveWorkspaceContext) {
  return navItems.filter((item) => {
    if ("settingsOnly" in item && item.settingsOnly) {
      return (
        workspaceContext.role !== "owner" &&
        (canManageWorkspaceSettings(workspaceContext.role) ||
          workspaceContext.rolePermissions?.can_view_settings === true)
      );
    }

    if ("ownerOnly" in item && item.ownerOnly) {
      return canAccessOwnerConsole(workspaceContext.role);
    }

    if ("moduleKey" in item) {
      return workspaceContext.modules?.[item.moduleKey] !== false;
    }

    return true;
  });
}
