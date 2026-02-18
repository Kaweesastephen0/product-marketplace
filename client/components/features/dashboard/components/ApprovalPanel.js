"use client";

import { useState } from "react";

import { useProductsQuery } from "@/components/features/products/hooks/useProductsQuery";
import { useProductMutations } from "@/components/features/products/hooks/useProductMutations";
import { useNotify } from "@/hooks/useNotify";

export default function ApprovalPanel() {
  const [page, setPage] = useState(1);
  const notify = useNotify();
  const productsQuery = useProductsQuery({ page, status: "pending_approval" });
  const { approve, reject } = useProductMutations({ page, status: "pending_approval" });

  const rows = productsQuery.data?.results || [];
  const pages = Math.max(1, Math.ceil((productsQuery.data?.count || 0) / 20));

  const onApprove = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    try {
      await approve.mutateAsync(id);
      notify.success("Product approved");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const onReject = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    try {
      await reject.mutateAsync(id);
      notify.warning("Product rejected and moved to draft");
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <div>
      <h2 className="m-0 mb-3 text-xl font-semibold text-[#211f1a]">Product Approvals</h2>

      <div className="overflow-x-auto rounded-xl border border-[#e3decf]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-[#f5f2e8] text-left text-[#4c493f]">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#efe9d7]">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">{row.status}</span>
                </td>
                <td className="px-3 py-2">${Number(row.price).toFixed(2)}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onApprove(row.id)}
                      disabled={!row?.id}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(row.id)}
                      disabled={!row?.id}
                      className="rounded-lg border border-amber-400 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!rows.length && !productsQuery.isLoading ? (
              <tr className="border-t border-[#efe9d7]">
                <td colSpan={4} className="px-3 py-4 text-center text-[#6f6c63]">
                  No products pending approval.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-[#d6d0be] px-3 py-1 hover:bg-[#f1eee2] disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-[#6f6c63]">
          {page} / {pages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
          disabled={page >= pages}
          className="rounded-lg border border-[#d6d0be] px-3 py-1 hover:bg-[#f1eee2] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
