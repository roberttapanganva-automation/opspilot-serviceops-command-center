import { createServerClient } from "@supabase/ssr";
import { type User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabaseEnv,
  getSupabaseEnvError,
  hasSupabaseEnv,
} from "./env";

type SessionUpdateResult = {
  envError?: string;
  response: NextResponse;
  user: User | null;
};

export async function updateSession(
  request: NextRequest,
): Promise<SessionUpdateResult> {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasSupabaseEnv()) {
    return {
      envError: getSupabaseEnvError(),
      response: supabaseResponse,
      user: null,
    };
  }

  const { supabaseAnonKey, supabaseUrl } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, options, value }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    response: supabaseResponse,
    user,
  };
}

export function copySupabaseCookies(
  fromResponse: NextResponse,
  toResponse: NextResponse,
) {
  fromResponse.cookies.getAll().forEach((cookie) => {
    toResponse.cookies.set(cookie);
  });
}
