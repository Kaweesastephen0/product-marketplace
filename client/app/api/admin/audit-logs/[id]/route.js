import { proxyAuthenticated } from "@/lib/backend-server";
import { NextResponse } from "next/server";

// parseId() parses and validates a positive numeric id from route params.
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// DELETE() handles DELETE requests for /api/admin/audit-logs/${id}/ and forwards them to backend.
export async function DELETE(_request, { params }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) {
    return NextResponse.json({ detail: "Invalid audit log id." }, { status: 400 });
  }
  return proxyAuthenticated(`/api/admin/audit-logs/${id}/`, { method: "DELETE" });
}
