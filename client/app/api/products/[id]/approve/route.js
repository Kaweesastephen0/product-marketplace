import { proxyAuthenticated } from "@/lib/backend-server";

export async function POST(_request, { params }) {
  return proxyAuthenticated(`/api/products/${params.id}/approve/`, { method: "POST", body: {} });
}
