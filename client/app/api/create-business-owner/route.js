import { proxyAuthenticated } from "@/lib/backend-server";

// Handles POST requests for creating business owners and forwards them to backend.
export async function POST(request) {
  const body = await request.json();
  return proxyAuthenticated("/api/create-business-owner/", { method: "POST", body });
}
