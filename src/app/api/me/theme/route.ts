import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getThemePreference } from "@/lib/theme/getThemePreference";
import { updateThemeModeSchema } from "@/lib/validation/profile";
import type { ApiResponse } from "@/types/api";
import type { ThemeMode, UserThemePreference } from "@/types/domain";

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonResponse(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in to update your theme preference.",
        },
        ok: false,
      },
      401,
    );
  }

  try {
    const payload = updateThemeModeSchema.parse(await request.json());
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          theme_mode: payload.theme_mode,
        },
        {
          onConflict: "id",
        },
      )
      .select("theme_mode")
      .single<{ theme_mode: ThemeMode }>();

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "THEME_UPDATE_FAILED",
            message: "We could not update your theme preference.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    return jsonResponse<UserThemePreference>({
      data: await getThemePreference(),
      ok: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Choose System, Light, or Dark.",
            details: error.flatten().fieldErrors,
          },
          ok: false,
        },
        400,
      );
    }

    return jsonResponse(
      {
        error: {
          code: "BAD_REQUEST",
          message: "We could not read the theme preference.",
        },
        ok: false,
      },
      400,
    );
  }
}
