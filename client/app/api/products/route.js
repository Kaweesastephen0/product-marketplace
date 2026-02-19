import { proxyAuthenticated } from "@/lib/backend-server";

// Handles GET requests for getting products and forwards them to backend.
export async function GET(request) {
  const { search } = new URL(request.url);
  return proxyAuthenticated(`/api/products/${search}`);
}

// Handles POST requests for adding products and forwards them to backend.
export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : await request.json();
  return proxyAuthenticated("/api/products/", { method: "POST", body });
}
