import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOptions } from "@/lib/auth-cookies";
import { backendLogout } from "@/lib/backend-server";

// Handles POST requests for the logout route and forwards them to backend.
export async function POST() {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refresh) {
    try {
      await backendLogout(access, refresh);
    } catch {
      // Continue clearing cookies regardless of backend errors.
      cookies.remove("ACCESS_COOKIE");
      cookies.remove("REFRESH_COOKIE")

    }
  }

  cookieStore.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  cookieStore.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
