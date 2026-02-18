import { proxyAuthenticated } from "@/lib/backend-server";

// Handles GET requests for this route and forwards them to backend.
export async function GET() {
  return proxyAuthenticated("/api/businesses/");
}
