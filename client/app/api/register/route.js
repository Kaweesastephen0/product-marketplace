import { proxyPublic } from "@/lib/backend-server";

// Handles POST requests for registering users this route and forwards them to backend.
export async function POST(request) {
  const body = await request.json();
  return proxyPublic("/api/register/", { method: "POST", body });
}
