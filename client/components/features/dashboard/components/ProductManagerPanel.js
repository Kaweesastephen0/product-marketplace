"use client";

import { useEffect, useState } from "react";
import SellOutlined from "@mui/icons-material/SellOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";

import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import IconInput from "@/components/ui/IconInput";
import TablePagination from "@/components/ui/TablePagination";
import { useProductsQuery } from "@/components/features/products/hooks/useProductsQuery";
import { useProductMutations } from "@/components/features/products/hooks/useProductMutations";
import { useNotify } from "@/hooks/useNotify";

const emptyForm = { name: "", description: "", price: "" };

function sectionToStatus(section) {
  if (section === "pending") return "pending_approval";
  if (section === "confirmed") return "approved";
  return "";
}

export default function ProductManagerPanel({ mode, section }) {
  const [page, setPage] = useState(1);
  const hideDraftProducts = mode === "owner" || mode === "approver";
  const [status, setStatus] = useState(hideDraftProducts ? "pending_approval" : sectionToStatus(section));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
  const visibleRows = hideDraftProducts ? rows.filter((row) => row.status !== "draft") : rows;
  const totalCount = productsQuery.data?.count || 0;
  const pages = Math.max(1, Math.ceil(totalCount / 20));

  const loading =
    productsQuery.isLoading ||
    mutations.create.isPending ||
    mutations.update.isPending ||
    mutations.approve.isPending ||
    mutations.submit.isPending ||
    mutations.remove.isPending;

  useEffect(() => {
    if (section === "pending" || section === "confirmed") {
      setStatus(sectionToStatus(section));
      setPage(1);
    }
  }, [section]);

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
    setDeleteTarget(rows.find((row) => row.id === id) || { id, name: "this product" });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget?.id) return;
    try {
      await mutations.remove.mutateAsync(deleteTarget.id);
      notify.success("Product deleted");
      setDeleteTarget(null);
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
          ]
            .filter((option) => !(hideDraftProducts && (option.value === "" || option.value === "draft")))
            .map((option) => (
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
            {visibleRows.map((row) => (
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
                    {canEdit && row.status !== "approved" ? (
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

            {!visibleRows.length && !productsQuery.isLoading ? (
              <tr className="border-t border-[#efe9d7]">
                <td colSpan={showSubmittedBy ? 5 : 4} className="px-3 py-4 text-center text-[#6f6c63]">
                  No products available.
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

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Product" : "Create Product"}
        maxWidthClass="max-w-xl"
      >
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Name</span>
            <IconInput
              icon={SellOutlined}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Description</span>
            <IconInput
              icon={DescriptionOutlined}
              as="textarea"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Price</span>
            <IconInput
              icon={AttachMoneyOutlined}
              type="number"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
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
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name || "this product"}"?`}
        confirmLabel="Delete"
        pending={mutations.remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteProduct}
      />
    </div>
  );
}
