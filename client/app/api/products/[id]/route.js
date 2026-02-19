import { proxyAuthenticated } from "@/lib/backend-server";
import { NextResponse } from "next/server";

// Parses and validates a positive numeric id from route params.
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Handles PATCH requests for updating products and forwards them to backend.
export async function PATCH(request, { params }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ detail: "Invalid product id." }, { status: 400 });
  }
  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : await request.json();
  return proxyAuthenticated(`/api/products/${id}/`, { method: "PATCH", body });
}

// Handles DELETE requests for this route and forwards them to backend.
export async function DELETE(_request, { params }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ detail: "Invalid product id." }, { status: 400 });
  }
  return proxyAuthenticated(`/api/products/${id}/`, { method: "DELETE" });
}
