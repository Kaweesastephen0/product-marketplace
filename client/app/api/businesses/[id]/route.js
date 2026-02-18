import { proxyAuthenticated } from "@/lib/backend-server";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return proxyAuthenticated(`/api/businesses/${id}/`, { method: "PATCH", body });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  return proxyAuthenticated(`/api/businesses/${id}/`, { method: "DELETE" });
}
