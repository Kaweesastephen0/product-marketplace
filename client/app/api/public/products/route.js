import { proxyPublic } from "@/lib/backend-server";

// Handles GET requests for approved products for the public and forwards them to backend.
export async function GET(request) {
  const { search } = new URL(request.url);
  return proxyPublic(`/api/public/products/${search}`);
}
