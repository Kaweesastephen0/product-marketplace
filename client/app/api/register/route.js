import { proxyPublic } from "@/lib/backend-server";

export async function POST(request) {
  const body = await request.json();
  return proxyPublic("/api/register/", { method: "POST", body });
}
