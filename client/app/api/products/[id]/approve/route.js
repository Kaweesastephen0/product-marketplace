import { proxyAuthenticated } from "@/lib/backend-server";
import { NextResponse } from "next/server";

// Parses and validates a positive numeric id from route params.
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Handles POST requests for approving products and forwards them to backend.
export async function POST(_request, { params }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ detail: "Invalid product id." }, { status: 400 });
  }
  return proxyAuthenticated(`/api/products/${id}/approve/`, { method: "POST", body: {} });
}
