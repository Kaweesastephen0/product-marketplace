import { proxyAuthenticated } from "@/lib/backend-server";

// Handles GET requests for /api/admin/statistics/ and forwards them to backend.
export async function GET() {
  return proxyAuthenticated("/api/admin/statistics/");
}
