import { proxyAuthenticated } from "@/lib/backend-server";

export async function POST(request) {
  const body = await request.json();
  return proxyAuthenticated("/api/create-business-owner/", { method: "POST", body });
}
