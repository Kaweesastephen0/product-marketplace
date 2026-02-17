import { proxyAuthenticated } from "@/lib/backend-server";

export async function PATCH(request, { params }) {
  const body = await request.json();
  return proxyAuthenticated(`/api/products/${params.id}/`, { method: "PATCH", body });
}

export async function DELETE(_request, { params }) {
  return proxyAuthenticated(`/api/products/${params.id}/`, { method: "DELETE" });
}
