import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/AppShell";

export default function ProtectedAppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
