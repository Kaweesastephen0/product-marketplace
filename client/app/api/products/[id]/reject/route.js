import { proxyAuthenticated } from "@/lib/backend-server";
import { NextResponse } from "next/server";

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function POST(_request, { params }) {
  const id = parseId(params.id);
  if (!id) {
    return NextResponse.json({ detail: "Invalid product id." }, { status: 400 });
  }
  return proxyAuthenticated(`/api/products/${id}/reject/`, { method: "POST", body: {} });
}
