import { proxyAuthenticated } from "@/lib/backend-server";

// Handles GET requests for getting users through this route and forwards them to backend.
export async function GET() {
  return proxyAuthenticated("/api/users/");
}

// Handles POST requests for creating users through this route and forwards them to backend.
export async function POST(request) {
  const body = await request.json();
  return proxyAuthenticated("/api/users/", { method: "POST", body });
}
