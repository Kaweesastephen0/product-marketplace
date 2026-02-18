"use client";

import { useEffect, useState } from "react";
import SellOutlined from "@mui/icons-material/SellOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";

import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import IconInput from "@/components/ui/IconInput";
import TablePagination from "@/components/ui/TablePagination";
import { useProductsQuery } from "@/components/features/products/useProductsQuery";
import { useProductMutations } from "@/components/features/products/useProductMutations";
import { useNotify } from "@/hooks/useNotify";

const emptyForm = { name: "", description: "", price: "", image_url: "", image: null };

// Maps dashboard section keys to product status filter values.
function sectionToStatus(section) {
  if (section === "pending") return "pending_approval";
  if (section === "confirmed") return "approved";
  if (section === "rejected") return "rejected";
  return "";
}

// Renders product filters, product table, and create/edit product workflows.
export default function ProductManagerPanel({ mode, section }) {
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const hideDraftProducts = mode === "owner" || mode === "approver";
  const hideAllFilter = mode === "approver";
  const [status, setStatus] = useState(hideDraftProducts ? "pending_approval" : sectionToStatus(section));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const notify = useNotify();
  const productsQuery = useProductsQuery({ page, status });
  const mutations = useProductMutations({ page, status });

  const canCreate = mode === "owner" || mode === "editor";
  const canEdit = mode === "editor";
  const canSubmit = canCreate;
  const canDelete = mode === "admin";
  const canApprove = mode === "approver";
  const canView = mode === "admin";
  const showSubmittedBy = mode === "admin";

  const rows = productsQuery.data?.results || [];
  const visibleRows = hideDraftProducts ? rows.filter((row) => row.status !== "draft") : rows;
  const filteredRows = visibleRows.filter((row) =>
    [row.name, row.description, row.status, row.rejection_reason, row.created_by_email, row.price]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const totalCount = productsQuery.data?.count || 0;
  const pages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const loading =
    productsQuery.isLoading ||
    mutations.create.isPending ||
    mutations.update.isPending ||
    mutations.approve.isPending ||
    mutations.submit.isPending ||
    mutations.remove.isPending;

  useEffect(() => {
    if (section === "pending" || section === "confirmed" || section === "rejected") {
      setStatus(sectionToStatus(section));
      setPage(1);
    }
  }, [section]);

  useEffect(() => {
    if (form.image) {
      const objectUrl = URL.createObjectURL(form.image);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (form.image_url.trim()) {
      setImagePreview(form.image_url.trim());
      return;
    }

    if (editing?.display_image_url) {
      setImagePreview(editing.display_image_url);
      return;
    }

    setImagePreview("");
  }, [form.image, form.image_url, editing]);

  // Opens the product form in create mode and resets form state.
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  // Opens the product form in edit mode with the selected product values.
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url || "",
      image: null,
    });
    setDialogOpen(true);
  };

  // Validates product form input and creates or updates the product.
  const onSave = async () => {
    try {
      if (!form.name || Number(form.price) <= 0) {
        notify.warning("Please provide a valid name and price");
        return;
      }
      if (form.image && form.image_url.trim()) {
        notify.warning("Provide either an image upload or an image URL, not both");
        return;
      }

      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
      };
      if (form.image) {
        payload.image = form.image;
      } else if (form.image_url.trim()) {
        payload.image_url = form.image_url.trim();
      }

      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, payload });
        notify.success("Product updated successfully");
      } else {
        await mutations.create.mutateAsync(payload);
        notify.success("Product created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  // Submits a draft or rejected product for approval review.
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

  // Approves the selected product through the product mutation.
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

  // Sets the selected product as the delete confirmation target.
  const deleteProduct = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    setDeleteTarget(rows.find((row) => row.id === id) || { id, name: "this product" });
  };

  // Deletes the selected product after confirmation.
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

  // Opens the product details modal for the selected row.
  const viewProduct = (row) => {
    if (!row?.id) {
      notify.error("Invalid product id");
      return;
    }
    setViewTarget(row);
    setViewModalOpen(true);
  };

  // Validates the chosen file and stores it as the product image.
  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.warning("Only image files are allowed");
      return;
    }
    setForm((prev) => ({ ...prev, image: file, image_url: "" }));
  };

  return (
    <div>
      <div className="mb-3 grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_auto_1fr]">
        <h2 className="m-0 text-xl font-semibold text-[#211f1a] md:justify-self-start">Product Management</h2>
        <div className="w-full md:w-72 md:justify-self-center">
          <IconInput
            icon={SearchOutlined}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="py-1.5 text-xs"
          />
        </div>
        <div
          className={`flex items-center gap-2 md:justify-self-end ${
            mode === "editor" ? "flex-nowrap whitespace-nowrap overflow-x-auto" : "flex-wrap"
          }`}
        >
          {[
            { label: "All", value: "" },
            { label: "Draft", value: "draft" },
            { label: "Pending", value: "pending_approval" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ]
            .filter((option) => {
              if (hideDraftProducts && option.value === "draft") return false;
              if (hideAllFilter && option.value === "") return false;
              return true;
            })
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
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white hover:bg-[#135a47]"
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
              <th className="px-3 py-2 font-medium">No.</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Price</th>
              {showSubmittedBy ? <th className="px-3 py-2 font-medium">Submitted By</th> : null}
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
                        : row.status === "pending_approval"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {row.status}
                  </span>
                  {row.status === "rejected" && row.rejection_reason ? (
                    <p className="m-0 mt-1 text-xs text-rose-700">Reason: {row.rejection_reason}</p>
                  ) : null}
                </td>
                <td className="px-3 py-2">${Number(row.price).toFixed(2)}</td>
                {showSubmittedBy ? <td className="px-3 py-2">{row.created_by_email || "-"}</td> : null}
                <td className="px-3 py-2">
                  <div
                    className={`flex justify-end gap-1.5 ${
                      mode === "editor" ? "flex-nowrap whitespace-nowrap" : "flex-wrap"
                    }`}
                  >
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
                    {canView ? (
                      <button
                        type="button"
                        onClick={() => viewProduct(row)}
                        disabled={!row?.id}
                        className="rounded-lg border border-[#d6d0be] px-2.5 py-1 text-xs hover:bg-[#f1eee2] disabled:opacity-60"
                      >
                        View
                      </button>
                    ) : null}
                    {canSubmit ? (
                      <button
                        type="button"
                        onClick={() => submitForApproval(row.id)}
                        disabled={!row?.id || !["draft", "rejected"].includes(row.status)}
                        className="rounded-lg border border-[#d6d0be] px-2.5 py-1 text-xs hover:bg-[#f1eee2] disabled:opacity-60"
                      >
                        {row.status === "rejected" ? "Resubmit" : "Submit"}
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

            {!filteredRows.length && !productsQuery.isLoading ? (
              <tr className="border-t border-[#efe9d7]">
                <td colSpan={showSubmittedBy ? 6 : 5} className="px-3 py-4 text-center text-[#6f6c63]">
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
            {viewTarget.rejection_reason ? (
              <div>
                <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Rejection Reason</p>
                <p className="m-0 mt-1 text-sm text-[#211f1a]">{viewTarget.rejection_reason}</p>
              </div>
            ) : null}
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
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Image URL</span>
            <IconInput
              icon={LinkOutlined}
              value={form.image_url}
              onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value, image: null }))}
              placeholder="https://example.com/image.jpg"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Image Upload</span>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleImageSelect(event.dataTransfer.files?.[0]);
              }}
              className={`rounded-lg border bg-white px-3 py-2 ${
                dragActive ? "border-[#176c55] ring-2 ring-[#176c55]/20" : "border-[#d6d0be]"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-sm text-[#6f6c63]">
                <ImageOutlined fontSize="small" />
                <span>{form.image?.name || "Upload an image file"}</span>
              </div>
              <p className="m-0 mb-2 text-xs text-[#6f6c63]">Drag & drop an image here, or choose a file.</p>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleImageSelect(event.target.files?.[0])}
                className="w-full text-sm"
              />
            </div>
          </label>
          {imagePreview ? (
            <div className="overflow-hidden rounded-lg border border-[#d6d0be] bg-[#f7f4eb]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Selected product preview"
                className="h-44 w-full object-cover"
              />
            </div>
          ) : null}
          {editing?.display_image_url ? (
            <p className="m-0 text-xs text-[#6f6c63]">
              Current image is set and will remain unless you upload a new file or enter a new image URL.
            </p>
          ) : null}
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
