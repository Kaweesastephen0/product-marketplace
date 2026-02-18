"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Modal from "@/components/ui/Modal";
import { useNotify } from "@/hooks/useNotify";
import { adminService } from "@/lib/services/admin.service";
import { businessService } from "@/lib/services/business.service";

const initialForm = {
  email: "",
  password: "",
  role: "editor",
  business_id: "",
  business_name: "",
};

export default function UserManagementPanel({ mode = "owner" }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const notify = useNotify();
  const queryClient = useQueryClient();

  const usersQuery = useQuery({ queryKey: ["business-users"], queryFn: businessService.listUsers });

  const createMutation = useMutation({
    mutationFn: businessService.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-users"] }),
  });
  const createBusinessOwnerMutation = useMutation({
    mutationFn: adminService.createBusinessOwner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-users"] }),
  });

  const onCreate = async () => {
    try {
      if (mode === "admin" && form.role === "business_owner") {
        if (!form.business_name) {
          notify.warning("Business profile must be created first (business name is required)");
          return;
        }
        await createBusinessOwnerMutation.mutateAsync({
          business_name: form.business_name,
          owner_email: form.email,
          owner_password: form.password,
        });
      } else {
        const payload =
          mode === "admin"
            ? {
                email: form.email,
                password: form.password,
                role: form.role,
                business_id:
                  form.role === "admin"
                    ? undefined
                    : form.business_id
                      ? Number(form.business_id)
                      : undefined,
              }
            : {
                email: form.email,
                password: form.password,
                role: form.role,
              };

        await createMutation.mutateAsync(payload);
      }

      notify.success("User created successfully");
      setForm(initialForm);
      setOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const users = usersQuery.data || [];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-xl font-semibold text-[#211f1a]">User Management</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47]"
        >
          Add User
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e3decf]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-[#f5f2e8] text-left text-[#4c493f]">
            <tr>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th>
              {mode === "admin" ? <th className="px-3 py-2 font-medium">Business</th> : null}
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[#efe9d7]">
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2 capitalize">{user.role}</td>
                {mode === "admin" ? <td className="px-3 py-2">{user.business_id ?? "-"}</td> : null}
                <td className="px-3 py-2">{user.is_active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Business User">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm text-[#211f1a]">Role</legend>
            <div className="flex flex-wrap gap-3 text-sm">
              {(mode === "admin"
                ? ["admin", "business_owner", "editor", "approver", "viewer"]
                : ["editor", "approver"]
              ).map((role) => (
                <label key={role} className="inline-flex items-center gap-1">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={form.role === role}
                    onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  />
                  <span className="capitalize">{role.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {mode === "admin" && form.role === "business_owner" ? (
            <label className="block">
              <span className="mb-1 block text-sm text-[#211f1a]">Business Name</span>
              <input
                value={form.business_name}
                onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
                className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
              />
              <span className="mt-1 block text-xs text-[#6f6c63]">
                A new business profile will be created first, then owner account
              </span>
            </label>
          ) : null}

          {mode === "admin" && form.role !== "admin" && form.role !== "business_owner" ? (
            <label className="block">
              <span className="mb-1 block text-sm text-[#211f1a]">Business ID</span>
              <input
                type="number"
                value={form.business_id}
                onChange={(e) => setForm((prev) => ({ ...prev, business_id: e.target.value }))}
                className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
              />
              <span className="mt-1 block text-xs text-[#6f6c63]">Required for editor/approver/viewer accounts</span>
            </label>
          ) : null}

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
              onClick={onCreate}
              disabled={createMutation.isPending || createBusinessOwnerMutation.isPending}
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
