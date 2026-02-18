"use client";

import { useEffect, useState } from "react";

import { useProductsQuery } from "@/components/features/products/useProductsQuery";
import { useProductMutations } from "@/components/features/products/useProductMutations";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import IconInput from "@/components/ui/IconInput";
import Modal from "@/components/ui/Modal";
import TablePagination from "@/components/ui/TablePagination";
import { useNotify } from "@/hooks/useNotify";

// Maps dashboard section keys to product status filter values.
function sectionToStatus(section) {
  if (section === "pending") return "pending_approval";
  if (section === "confirmed") return "approved";
  if (section === "rejected") return "rejected";
  return "";
}

// Renders approver product list with view, approve, and reject actions.
export default function ApprovalPanel({ section = "pending" }) {
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(sectionToStatus(section));
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const notify = useNotify();
  const productsQuery = useProductsQuery({ page, status });
  const { approve, reject } = useProductMutations({ page, status });

  const rows = productsQuery.data?.results || [];
  const filteredRows = rows.filter((row) =>
    [row.name, row.status, row.price]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil((productsQuery.data?.count || 0) / PAGE_SIZE));

  useEffect(() => {
    setStatus(sectionToStatus(section));
    setPage(1);
  }, [section]);

  // Approves the selected pending product.
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

  // Opens the reject modal for the selected product.
  const onOpenReject = (row) => {
    if (!row?.id) {
      notify.error("Invalid product id");
      return;
    }
    setRejectTarget(row);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  // Rejects the selected product using the provided rejection reason.
  const onReject = async () => {
    if (!rejectTarget?.id) return;
    if (!rejectReason.trim()) {
      notify.warning("Rejection reason is required");
      return;
    }
    try {
      await reject.mutateAsync({ id: rejectTarget.id, reason: rejectReason.trim() });
      notify.warning("Product rejected");
      setRejectModalOpen(false);
      setRejectTarget(null);
      setRejectReason("");
    } catch (error) {
      notify.error(error.message);
    }
  };

  // Opens the product details modal for the selected product.
  const onView = (row) => {
    setViewTarget(row);
    setViewModalOpen(true);
  };

  return (
    <div>
      <div className="mb-3 grid grid-cols-1 items-center gap-2 lg:grid-cols-[1fr_auto_1fr]">
        <h2 className="m-0 text-xl font-semibold text-[#211f1a]">Approver Products</h2>
        <div className="w-full lg:w-72 lg:justify-self-center">
          <IconInput
            icon={SearchOutlined}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="py-1.5 text-xs"
          />
        </div>
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap lg:justify-self-end">
          {[
            { label: "All", value: "" },
            { label: "Pending", value: "pending_approval" },
            { label: "Rejected", value: "rejected" },
            { label: "Approved", value: "approved" },
          ].map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              onClick={() => {
                setStatus(option.value);
                setPage(1);
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                status === option.value
                  ? "border-[#0f5132] bg-[#0f5132] text-white"
                  : "border-[#d6d0be] text-[#211f1a] hover:bg-[#f1eee2]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e3decf]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-[#f5f2e8] text-left text-[#4c493f]">
            <tr>
              <th className="px-3 py-2 font-medium">No.</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={row.id} className="border-t border-[#efe9d7]">
                <td className="px-3 py-2">{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      row.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : row.status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2">${Number(row.price).toFixed(2)}</td>
                <td className="px-3 py-2">
                  {row.status === "pending_approval" ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(row)}
                        disabled={!row?.id}
                        className="rounded-lg border border-[#d6d0be] px-2.5 py-1 text-xs font-medium text-[#211f1a] hover:bg-[#f1eee2] disabled:opacity-60"
                      >
                        View
                      </button>
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
                        onClick={() => onOpenReject(row)}
                        disabled={!row?.id}
                        className="rounded-lg border border-amber-400 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="float-right text-xs text-[#6f6c63]">No actions</span>
                  )}
                </td>
              </tr>
            ))}

            {!filteredRows.length && !productsQuery.isLoading ? (
              <tr className="border-t border-[#efe9d7]">
                <td colSpan={5} className="px-3 py-4 text-center text-[#6f6c63]">
                  No products found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={page}
        totalPages={pages}
        onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(pages, prev + 1))}
      />

      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Product Details" maxWidthClass="max-w-xl">
        {viewTarget ? (
          <div className="space-y-3">
            {viewTarget.display_image_url ? (
              <div className="overflow-hidden rounded-lg border border-[#d6d0be] bg-[#f7f4eb]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewTarget.display_image_url}
                  alt={viewTarget.name}
                  className="h-48 w-full object-cover"
                />
              </div>
            ) : null}
            <div>
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Name</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{viewTarget.name}</p>
            </div>
            <div>
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Description</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{viewTarget.description || "No description."}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Status</p>
                <p className="m-0 mt-1 text-sm text-[#211f1a]">{viewTarget.status}</p>
              </div>
              <div>
                <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Price</p>
                <p className="m-0 mt-1 text-sm text-[#211f1a]">${Number(viewTarget.price).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Product" maxWidthClass="max-w-lg">
        <div className="space-y-3">
          <p className="m-0 text-sm text-[#211f1a]">
            Provide a rejection reason for <strong>{rejectTarget?.name || "this product"}</strong>.
          </p>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Reason</span>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
              placeholder="Explain what must be corrected before approval."
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onReject}
              disabled={reject.isPending}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
            >
              Confirm Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
