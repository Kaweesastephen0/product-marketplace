import { proxyPublic } from "@/lib/backend-server";

export async function GET(request) {
  const { search } = new URL(request.url);
  return proxyPublic(`/api/public/products/${search}`);
}
