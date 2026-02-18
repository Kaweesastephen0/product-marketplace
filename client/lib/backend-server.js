import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOptions } from "@/lib/auth-cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function callBackend(path, { method = "GET", token, body } = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    cache: "no-store",
  });
}

async function refreshToken(cookieStore) {
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  const refreshResponse = await callBackend("/api/auth/refresh/", {
    method: "POST",
    body: { refresh },
  });

  if (!refreshResponse.ok) {
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
    return null;
  }

  const payload = await refreshResponse.json();
  const access = payload.access;
  const nextRefresh = payload.refresh || refresh;

  cookieStore.set(ACCESS_COOKIE, access, cookieOptions);
  cookieStore.set(REFRESH_COOKIE, nextRefresh, cookieOptions);
  return access;
}

export async function proxyAuthenticated(path, { method = "GET", body } = {}) {
  const cookieStore = await cookies();
  let access = cookieStore.get(ACCESS_COOKIE)?.value;
  let response;
  try {
    response = await callBackend(path, { method, token: access, body });
  } catch {
    return NextResponse.json({ detail: "Backend service unavailable." }, { status: 503 });
  }

  if (response.status === 401) {
    access = await refreshToken(cookieStore);
    if (!access) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    try {
      response = await callBackend(path, { method, token: access, body });
    } catch {
      return NextResponse.json({ detail: "Backend service unavailable." }, { status: 503 });
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(data, { status: response.status });
}

export async function proxyPublic(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await callBackend(path, { method, body });
  } catch {
    return NextResponse.json({ detail: "Backend service unavailable." }, { status: 503 });
  }
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(data, { status: response.status });
}

export async function backendLogin(email, password) {
  return callBackend("/api/auth/login/", {
    method: "POST",
    body: { email, password },
  });
}

export async function backendLogout(access, refresh) {
  return callBackend("/api/auth/logout/", {
    method: "POST",
    token: access,
    body: { refresh },
  });
}
