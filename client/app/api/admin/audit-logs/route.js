import { proxyAuthenticated } from "@/lib/backend-server";

// GET handles GET requests for this route and forwards them to backend.
export async function GET(request) {
  const { search } = new URL(request.url);
  return proxyAuthenticated(`/api/admin/audit-logs/${search}`);
}

// DELETE handles DELETE requests for this route and forwards them to backend.
export async function DELETE() {
  return proxyAuthenticated("/api/admin/audit-logs/clear/", { method: "DELETE" });
}
