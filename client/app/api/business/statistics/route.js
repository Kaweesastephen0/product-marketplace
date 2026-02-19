import { proxyAuthenticated } from "@/lib/backend-server";

// Handles GET requests for getting statistics forwards them to backend.
export async function GET() {
  return proxyAuthenticated("/api/business/statistics/");
}
