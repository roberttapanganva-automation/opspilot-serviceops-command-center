import {
  ChatCircleTextIcon,
} from "@phosphor-icons/react/ssr";
import { presentAuditActivity, buildAuditActivityLookups } from "@/lib/activity/presentation";
import { TopbarHeading } from "@/components/app-shell/TopbarHeading";
import { ThemeModeButton } from "@/components/theme/ThemeModeButton";
import { SignOutButton } from "@/components/app-shell/SignOutButton";
import { NotificationButton } from "@/components/app-shell/NotificationButton";
import { createClient } from "@/lib/supabase/server";
import type { ActiveWorkspaceContext } from "@/types/domain";

type TopbarProps = {
  workspaceContext: ActiveWorkspaceContext;
};

function getGreeting(timezone: string) {
  let hour = new Date().getHours();

  try {
    const hourText = new Intl.DateTimeFormat("en", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    }).format(new Date());

    hour = Number.parseInt(hourText, 10);
  } catch {
    hour = new Date().getHours();
  }

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getNameFromEmail(email: string | undefined) {
  if (!email) {
    return null;
  }

  return email.split("@")[0]?.replace(/[._-]+/g, " ") ?? null;
}

async function getDisplayName() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "there";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle<{ full_name: string | null }>();

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const displayName =
    profile?.full_name?.trim() ||
    metadataName?.trim() ||
    getNameFromEmail(user.email);

  return displayName ?? "there";
}

export async function Topbar({ workspaceContext }: TopbarProps) {
  const appName = workspaceContext.branding?.app_name ?? "OpsPilot";
  const displayName = await getDisplayName();
  const greeting = getGreeting(workspaceContext.workspace.timezone);
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("audit_logs")
    .select("id,action,actor_user_id,entity_id,entity_type,metadata,created_at")
    .eq("workspace_id", workspaceContext.workspace.id)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<
      Array<{
        action: string;
        actor_user_id: string | null;
        created_at: string;
        entity_id: string | null;
        entity_type: string;
        id: string;
        metadata: Record<string, unknown> | null;
      }>
    >();
  const notificationLookups = await buildAuditActivityLookups(
    supabase,
    notifications ?? [],
  );
  const notificationItems = (notifications ?? []).map((item) => {
    const presentation = presentAuditActivity(item, notificationLookups);

    return {
      category: presentation.category,
      detail: presentation.description,
      id: item.id,
      icon: presentation.icon,
      message: presentation.title,
      timestamp: item.created_at,
    };
  });

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--ops-border)] bg-[var(--ops-main-bg)]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ops-text-muted)]">
            {appName}
          </p>
          <TopbarHeading displayName={displayName} greeting={greeting} />
        </div>

        <div className="flex items-center gap-2" aria-label="Account tools">
            <button
              aria-label="Messages"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ops-border)] bg-white text-[var(--ops-text-soft)] shadow-sm transition hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-primary)]"
              type="button"
            >
              <ChatCircleTextIcon
                aria-hidden="true"
                size={20}
                weight="regular"
              />
            </button>
            <NotificationButton items={notificationItems} />
            <ThemeModeButton />
            <SignOutButton
              className="border border-[var(--ops-border)] bg-white text-[var(--ops-text-soft)] hover:bg-[var(--ops-card-soft)] hover:text-[var(--ops-text)]"
              compact
            />
        </div>
      </div>
    </header>
  );
}
