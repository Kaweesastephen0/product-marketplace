import { proxyAuthenticated } from "@/lib/backend-server";

// Handles GET requests for getting users information and forwards them to backend.
export async function GET() {
  return proxyAuthenticated("/api/auth/me/");
}

// Handles PATCH requests for updating users info and forwards them to backend.
export async function PATCH(request) {
  const body = await request.json();
  return proxyAuthenticated("/api/auth/me/", { method: "PATCH", body });
}
