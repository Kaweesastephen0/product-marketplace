import { proxyAuthenticated } from "@/lib/backend-server";
import { NextResponse } from "next/server";

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function POST(request, { params }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ detail: "Invalid product id." }, { status: 400 });
  }
  const body = await request.json();
  return proxyAuthenticated(`/api/products/${id}/reject/`, { method: "POST", body });
}
