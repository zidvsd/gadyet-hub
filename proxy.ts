// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
export async function proxy(request: NextRequest) {
  const { user, response } = await updateSession(request);
  const url = request.nextUrl.pathname;

  const protectedUserPages = [
    "/account",
    "/cart",
    "/orders",
    "/notifications",
    "/search",
  ];
  const isAdminPage = url.startsWith("/admin");

  const role = user?.app_metadata?.role;

  const isProtectedUserPage = protectedUserPages.some((page) =>
    url.startsWith(page),
  );

  if ((isProtectedUserPage || isAdminPage) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user) return response;

  if (isAdminPage && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (url === "/" && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
