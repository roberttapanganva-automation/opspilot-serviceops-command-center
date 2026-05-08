import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateCurrentUserLastSeen } from "@/lib/auth/lastSeen";
import type { ApiResponse } from "@/types/api";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiResponse<never>>(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in to update activity status.",
        },
        ok: false,
      },
      { status: 401 },
    );
  }

  await updateCurrentUserLastSeen();

  return NextResponse.json<ApiResponse<{ ok: true }>>({
    data: { ok: true },
    ok: true,
  });
}
