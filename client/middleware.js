import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookies";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const hasAccess = request.cookies.has(ACCESS_COOKIE);
    const hasRefresh = request.cookies.has(REFRESH_COOKIE);

    if (!hasAccess && !hasRefresh) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
