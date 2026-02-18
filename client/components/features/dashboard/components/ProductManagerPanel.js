"use client";

import { useState } from "react";

import Modal from "@/components/ui/Modal";
import { useProductsQuery } from "@/components/features/products/hooks/useProductsQuery";
import { useProductMutations } from "@/components/features/products/hooks/useProductMutations";
import { useNotify } from "@/hooks/useNotify";

const emptyForm = { name: "", description: "", price: "" };

export default function ProductManagerPanel({ mode }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const notify = useNotify();
  const productsQuery = useProductsQuery({ page, status });
  const mutations = useProductMutations({ page, status });

  const canCreate = mode === "owner" || mode === "editor";
  const canEdit = mode === "editor";
  const canSubmit = canCreate;
  const canDelete = mode === "admin";
  const canApprove = mode === "approver";
  const showSubmittedBy = mode === "admin";

  const rows = productsQuery.data?.results || [];
  const totalCount = productsQuery.data?.count || 0;
  const pages = Math.max(1, Math.ceil(totalCount / 20));

  const loading =
    productsQuery.isLoading ||
    mutations.create.isPending ||
    mutations.update.isPending ||
    mutations.approve.isPending ||
    mutations.submit.isPending ||
    mutations.remove.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description, price: item.price });
    setDialogOpen(true);
  };

  const onSave = async () => {
    try {
      if (!form.name || Number(form.price) <= 0) {
        notify.warning("Please provide a valid name and price");
        return;
      }

      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, payload: form });
        notify.success("Product updated successfully");
      } else {
        await mutations.create.mutateAsync(form);
        notify.success("Product created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const submitForApproval = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    try {
      await mutations.submit.mutateAsync(id);
      notify.info("Product submitted for approval");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const approveProduct = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    try {
      await mutations.approve.mutateAsync(id);
      notify.success("Product approved");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    if (!window.confirm("Delete this product?")) return;
    try {
      await mutations.remove.mutateAsync(id);
      notify.success("Product deleted");
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h2 className="m-0 text-xl font-semibold text-[#211f1a]">Product Management</h2>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "All", value: "" },
            { label: "Draft", value: "draft" },
            { label: "Pending", value: "pending_approval" },
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

          {canCreate ? (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47]"
            >
              Create Product
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e3decf]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-[#f5f2e8] text-left text-[#4c493f]">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Price</th>
              {showSubmittedBy ? <th className="px-3 py-2 font-medium">Submitted By</th> : null}
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#efe9d7]">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      row.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : row.status === "pending_approval"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2">${Number(row.price).toFixed(2)}</td>
                {showSubmittedBy ? <td className="px-3 py-2">{row.created_by_email || "-"}</td> : null}
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        disabled={!row?.id}
                        className="rounded-lg border border-[#d6d0be] px-2.5 py-1 text-xs hover:bg-[#f1eee2] disabled:opacity-60"
                      >
                        Edit
                      </button>
                    ) : null}
                    {canSubmit ? (
                      <button
                        type="button"
                        onClick={() => submitForApproval(row.id)}
                        disabled={!row?.id || row.status !== "draft"}
                        className="rounded-lg border border-[#d6d0be] px-2.5 py-1 text-xs hover:bg-[#f1eee2] disabled:opacity-60"
                      >
                        Submit
                      </button>
                    ) : null}
                    {canApprove ? (
                      <button
                        type="button"
                        onClick={() => approveProduct(row.id)}
                        disabled={!row?.id}
                        className="rounded-lg border border-emerald-500 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                      >
                        Approve
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => deleteProduct(row.id)}
                        disabled={!row?.id}
                        className="rounded-lg border border-rose-500 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}

            {!rows.length && !productsQuery.isLoading ? (
              <tr className="border-t border-[#efe9d7]">
                <td colSpan={showSubmittedBy ? 5 : 4} className="px-3 py-4 text-center text-[#6f6c63]">
                  No products available.
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

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Product" : "Create Product"}
        maxWidthClass="max-w-xl"
      >
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Price</span>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={loading}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47] disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
