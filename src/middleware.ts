import { type NextRequest, NextResponse } from "next/server";
import {
  copySupabaseCookies,
  updateSession,
} from "@/lib/supabase/middleware";

const protectedRoutes = [
  "/dashboard",
  "/leads",
  "/jobs",
  "/tasks",
  "/calendar",
  "/automations",
  "/settings",
];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { envError, response, user } = await updateSession(request);

  if (envError && isProtectedRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "supabase-env");

    const redirectResponse = NextResponse.redirect(redirectUrl);
    copySupabaseCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (!user && isProtectedRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    copySupabaseCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";

    const redirectResponse = NextResponse.redirect(redirectUrl);
    copySupabaseCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
