import { proxyAuthenticated } from "@/lib/backend-server";

export async function GET(request) {
  const { search } = new URL(request.url);
  return proxyAuthenticated(`/api/products/${search}`);
}

export async function POST(request) {
  const body = await request.json();
  return proxyAuthenticated("/api/products/", { method: "POST", body });
}
