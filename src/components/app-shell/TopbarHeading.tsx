"use client";

import {
  BriefcaseIcon,
  CalendarBlankIcon,
  CheckSquareIcon,
  CrownIcon,
  GearSixIcon,
  RowsIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

type TopbarHeadingProps = {
  displayName: string;
  greeting: string;
};

const routeTitles: Array<{
  Icon: typeof UsersThreeIcon;
  match: RegExp;
  title: string;
}> = [
  { Icon: CrownIcon, match: /^\/owner\/branding/, title: "Branding" },
  { Icon: CrownIcon, match: /^\/owner\/modules/, title: "Modules" },
  { Icon: CrownIcon, match: /^\/owner\/pipeline/, title: "Pipeline" },
  { Icon: CrownIcon, match: /^\/owner\/access-rules/, title: "Access Rules" },
  { Icon: CrownIcon, match: /^\/owner\/audit-logs/, title: "Audit Logs" },
  { Icon: CrownIcon, match: /^\/owner\/invitations/, title: "Invitations" },
  { Icon: CrownIcon, match: /^\/owner\/team/, title: "Team" },
  { Icon: CrownIcon, match: /^\/owner/, title: "Owner Console" },
  { Icon: UsersThreeIcon, match: /^\/leads/, title: "CRM" },
  { Icon: BriefcaseIcon, match: /^\/jobs/, title: "Jobs" },
  { Icon: CheckSquareIcon, match: /^\/tasks/, title: "Tasks" },
  { Icon: CalendarBlankIcon, match: /^\/calendar/, title: "Calendar" },
  { Icon: RowsIcon, match: /^\/pipelines/, title: "Pipelines" },
  { Icon: GearSixIcon, match: /^\/settings/, title: "Settings" },
];

export function TopbarHeading({
  displayName,
  greeting,
}: TopbarHeadingProps) {
  const pathname = usePathname();

  if (pathname === "/dashboard") {
    return (
      <h1 className="mt-1 text-xl font-semibold text-[var(--ops-text)]">
        {greeting}, {displayName}
      </h1>
    );
  }

  const routeMatch = routeTitles.find((item) => item.match.test(pathname));
  const routeTitle = routeMatch?.title ?? "Workspace";
  const RouteIcon = routeMatch?.Icon;

  return (
    <div className="mt-1 flex items-center gap-2">
      {RouteIcon ? (
        <RouteIcon
          aria-hidden="true"
          className="text-[var(--ops-primary-dark)]"
          size={22}
          weight="duotone"
        />
      ) : null}
      <h1 className="text-xl font-semibold text-[var(--ops-text)]">
        {routeTitle}
      </h1>
    </div>
  );
}
