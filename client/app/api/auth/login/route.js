import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOptions } from "@/lib/auth-cookies";
import { backendLogin } from "@/lib/backend-server";

// Handles POST requests for this route and forwards them to backend.
export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
    }

    const response = await backendLogin(email, password);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : {};

    if (!response.ok) {
      const detail = payload?.detail || "Login failed.";
      return NextResponse.json({ detail }, { status: response.status });
    }

    if (!payload?.access || !payload?.refresh) {
      return NextResponse.json({ detail: "Invalid authentication response." }, { status: 502 });
    }

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, payload.access, cookieOptions);
    cookieStore.set(REFRESH_COOKIE, payload.refresh, cookieOptions);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { detail: "Authentication service unavailable. Ensure Django API is running." },
      { status: 503 },
    );
  }
}
