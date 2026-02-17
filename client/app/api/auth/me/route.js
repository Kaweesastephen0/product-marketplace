import { proxyAuthenticated } from "@/lib/backend-server";

export async function GET() {
  return proxyAuthenticated("/api/auth/me/");
}
