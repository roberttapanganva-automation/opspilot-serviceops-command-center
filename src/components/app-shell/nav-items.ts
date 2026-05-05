import {
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  Settings,
  UsersRound,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/leads", label: "Leads", Icon: UsersRound },
  { href: "/jobs", label: "Jobs", Icon: BriefcaseBusiness },
  { href: "/tasks", label: "Tasks", Icon: ListTodo },
  { href: "/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/automations", label: "Automations", Icon: Bot },
  { href: "/settings", label: "Settings", Icon: Settings },
] as const;
