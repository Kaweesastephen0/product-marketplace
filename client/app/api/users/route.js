import { proxyAuthenticated } from "@/lib/backend-server";

export async function GET() {
  return proxyAuthenticated("/api/users/");
}

export async function POST(request) {
  const body = await request.json();
  return proxyAuthenticated("/api/users/", { method: "POST", body });
}
