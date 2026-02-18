"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { useEffect, useState } from "react";

import MetricCards from "@/components/features/dashboard/components/MetricCards";
import ProductManagerPanel from "@/components/features/dashboard/components/ProductManagerPanel";
import UserManagementPanel from "@/components/features/dashboard/components/UserManagementPanel";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import IconInput from "@/components/ui/IconInput";
import TablePagination from "@/components/ui/TablePagination";
import { useNotify } from "@/hooks/useNotify";
import { adminService } from "@/lib/services/admin.service";

const initialForm = { business_name: "", owner_email: "", owner_password: "" };
const PAGE_SIZE = 10;

export default function AdminPanel({ section = "overview" }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editBusiness, setEditBusiness] = useState({ id: null, name: "" });
  const [deleteBusinessTarget, setDeleteBusinessTarget] = useState(null);
  const [businessPage, setBusinessPage] = useState(1);
  const notify = useNotify();
  const queryClient = useQueryClient();

  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: adminService.statistics });
  const businessesQuery = useQuery({
    queryKey: ["admin-businesses", businessPage],
    queryFn: () => adminService.listBusinesses(businessPage),
  });

  const createOwner = useMutation({
    mutationFn: adminService.createBusinessOwner,
    onSuccess: () => {
      setBusinessPage(1);
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
  const updateBusinessMutation = useMutation({
    mutationFn: ({ id, payload }) => adminService.updateBusiness(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
  const deleteBusinessMutation = useMutation({
    mutationFn: adminService.deleteBusiness,
    onSuccess: () => {
      setBusinessPage(1);
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  const onCreateOwner = async () => {
    try {
      await createOwner.mutateAsync(form);
      notify.success("Business owner created successfully");
      setForm(initialForm);
      setOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const onOpenEditBusiness = (business) => {
    setEditBusiness({ id: business.id, name: business.name || "" });
    setEditOpen(true);
  };

  const onSaveBusiness = async () => {
    if (!editBusiness.id || !editBusiness.name.trim()) {
      notify.warning("Business name is required");
      return;
    }

    try {
      await updateBusinessMutation.mutateAsync({
        id: editBusiness.id,
        payload: { name: editBusiness.name.trim() },
      });
      notify.success("Business updated");
      setEditOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const onDeleteBusiness = async (business) => {
    if (!business?.id) return;
    setDeleteBusinessTarget(business);
  };

  const onConfirmDeleteBusiness = async () => {
    if (!deleteBusinessTarget?.id) return;
    try {
      await deleteBusinessMutation.mutateAsync(deleteBusinessTarget.id);
      notify.success("Business deleted");
      setDeleteBusinessTarget(null);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const stats = statsQuery.data || {};
  const businessesData = businessesQuery.data;
  const rawBusinesses = Array.isArray(businessesData) ? businessesData : businessesData?.results || [];
  const usesServerPagination =
    !Array.isArray(businessesData) && Array.isArray(businessesData?.results) && typeof businessesData?.count === "number";
  const businessPages = usesServerPagination
    ? Math.max(1, Math.ceil((businessesData.count || 0) / PAGE_SIZE))
    : Math.max(1, Math.ceil(rawBusinesses.length / PAGE_SIZE));
  const businesses = usesServerPagination
    ? rawBusinesses
    : rawBusinesses.slice((businessPage - 1) * PAGE_SIZE, businessPage * PAGE_SIZE);

  useEffect(() => {
    setBusinessPage((current) => Math.min(current, businessPages));
  }, [businessPages]);

  return (
    <div className="space-y-4">
      {(section === "overview" || section === "businesses") && (
        <MetricCards
          items={[
            { label: "Total Businesses", value: stats.total_businesses ?? "-" },
            { label: "Total Users", value: stats.total_users ?? "-" },
            { label: "Total Products", value: stats.total_products ?? "-" },
            {
              label: "Approved / Pending",
              value: `${stats.approved_products ?? 0} / ${stats.pending_products ?? 0}`,
            },
          ]}
        />
      )}

      {section === "businesses" ? (
        <section className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="m-0 text-xl font-semibold text-[#211f1a]">Business Management</h2>
              <p className="m-0 mt-1 text-sm text-[#6f6c63]">
                Create owners and manage existing businesses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47]"
            >
              Create Business Owner
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#e3decf]">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#f5f2e8] text-left text-[#4c493f]">
                <tr>
                  <th className="px-3 py-2 font-medium">Business</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Users</th>
                  <th className="px-3 py-2 font-medium">Products</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {businessesQuery.isLoading ? (
                  <tr className="border-t border-[#efe9d7]">
                    <td colSpan={5} className="px-3 py-4 text-center text-[#6f6c63]">
                      Loading businesses...
                    </td>
                  </tr>
                ) : null}
                {businesses.map((business) => (
                  <tr key={business.id} className="border-t border-[#efe9d7]">
                    <td className="px-3 py-2">{business.name}</td>
                    <td className="px-3 py-2">{business.owner_email || "-"}</td>
                    <td className="px-3 py-2">{business.total_users ?? 0}</td>
                    <td className="px-3 py-2">{business.total_products ?? 0}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditBusiness(business)}
                          disabled={updateBusinessMutation.isPending}
                          className="rounded-lg border border-[#d6d0be] px-2.5 py-1 text-xs font-medium text-[#211f1a] hover:bg-[#f1eee2] disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteBusiness(business)}
                          disabled={deleteBusinessMutation.isPending}
                          className="rounded-lg border border-rose-500 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!businessesQuery.isLoading && !businesses.length ? (
                  <tr className="border-t border-[#efe9d7]">
                    <td colSpan={5} className="px-3 py-4 text-center text-[#6f6c63]">
                      No businesses found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={businessPage}
            totalPages={businessPages}
            onPrev={() => setBusinessPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setBusinessPage((prev) => Math.min(businessPages, prev + 1))}
          />
        </section>
      ) : null}

      {section === "products" || section === "overview" ? (
        <section className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
          <ProductManagerPanel mode="admin" />
        </section>
      ) : null}

      {section === "users" ? (
        <section className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
          <UserManagementPanel mode="admin" />
        </section>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Business Owner">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Business Name</span>
            <IconInput
              icon={BusinessOutlined}
              value={form.business_name}
              onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Owner Email</span>
            <IconInput
              icon={EmailOutlined}
              value={form.owner_email}
              onChange={(e) => setForm((prev) => ({ ...prev, owner_email: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Owner Password</span>
            <IconInput
              icon={LockOutlined}
              type="password"
              value={form.owner_password}
              onChange={(e) => setForm((prev) => ({ ...prev, owner_password: e.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCreateOwner}
              disabled={createOwner.isPending}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47] disabled:opacity-60"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Business">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Business Name</span>
            <IconInput
              icon={BusinessOutlined}
              value={editBusiness.name}
              onChange={(e) => setEditBusiness((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSaveBusiness}
              disabled={updateBusinessMutation.isPending}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47] disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteBusinessTarget)}
        title="Delete Business"
        message={`Are you sure you want to delete "${deleteBusinessTarget?.name || "this business"}"?`}
        confirmLabel="Delete"
        pending={deleteBusinessMutation.isPending}
        onCancel={() => setDeleteBusinessTarget(null)}
        onConfirm={onConfirmDeleteBusiness}
      />
    </div>
  );
}
