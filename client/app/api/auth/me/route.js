import { proxyAuthenticated } from "@/lib/backend-server";

export async function GET() {
  return proxyAuthenticated("/api/auth/me/");
}

export async function PATCH(request) {
  const body = await request.json();
  return proxyAuthenticated("/api/auth/me/", { method: "PATCH", body });
}
