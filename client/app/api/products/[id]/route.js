import { proxyAuthenticated } from "@/lib/backend-server";
import { NextResponse } from "next/server";

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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

export async function DELETE(_request, { params }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ detail: "Invalid product id." }, { status: 400 });
  }
  return proxyAuthenticated(`/api/products/${id}/`, { method: "DELETE" });
}
