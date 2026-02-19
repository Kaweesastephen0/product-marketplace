import { proxyAuthenticated } from "@/lib/backend-server";

// Handles PATCH requests for updating business info and forwards them to backend.
export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return proxyAuthenticated(`/api/businesses/${id}/`, { method: "PATCH", body });
}

// Handles DELETE requests for deleting businesses and forwards them to backend.
export async function DELETE(_request, { params }) {
  const { id } = await params;
  return proxyAuthenticated(`/api/businesses/${id}/`, { method: "DELETE" });
}
