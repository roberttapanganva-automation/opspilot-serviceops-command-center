import { Badge } from "@/components/ui/Badge";
import type { MemberActivityStatus } from "@/types/domain";

export function getMemberActivityStatus(
  lastSeenAt: string | null,
): MemberActivityStatus {
  if (!lastSeenAt) {
    return "offline";
  }

  const age = Date.now() - new Date(lastSeenAt).getTime();

  if (age <= 5 * 60 * 1000) {
    return "online";
  }

  if (age <= 24 * 60 * 60 * 1000) {
    return "recently_active";
  }

  return "offline";
}

export function MemberActivityBadge({
  lastSeenAt,
}: {
  lastSeenAt: string | null;
}) {
  const status = getMemberActivityStatus(lastSeenAt);

  if (status === "online") {
    return <Badge variant="success">Online</Badge>;
  }

  if (status === "recently_active") {
    return <Badge variant="info">Recently active</Badge>;
  }

  return <Badge variant="warning">Offline</Badge>;
}
