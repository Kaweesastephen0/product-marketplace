"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import MetricCards from "@/components/features/dashboard/components/MetricCards";
import ProductManagerPanel from "@/components/features/dashboard/components/ProductManagerPanel";
import UserManagementPanel from "@/components/features/dashboard/components/UserManagementPanel";
import Modal from "@/components/ui/Modal";
import { useNotify } from "@/hooks/useNotify";
import { adminService } from "@/lib/services/admin.service";

const initialForm = { business_name: "", owner_email: "", owner_password: "" };

export default function AdminPanel({ section = "overview" }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const notify = useNotify();
  const queryClient = useQueryClient();

  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: adminService.statistics });

  const createOwner = useMutation({
    mutationFn: adminService.createBusinessOwner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-stats"] }),
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

  const stats = statsQuery.data || {};

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
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="m-0 text-xl font-semibold text-[#211f1a]">Business Management</h2>
              <p className="m-0 mt-1 text-sm text-[#6f6c63]">
                Create Business Owner accounts and expand marketplace coverage.
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
            <input
              value={form.business_name}
              onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
              className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Owner Email</span>
            <input
              value={form.owner_email}
              onChange={(e) => setForm((prev) => ({ ...prev, owner_email: e.target.value }))}
              className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Owner Password</span>
            <input
              type="password"
              value={form.owner_password}
              onChange={(e) => setForm((prev) => ({ ...prev, owner_password: e.target.value }))}
              className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
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
    </div>
  );
}
