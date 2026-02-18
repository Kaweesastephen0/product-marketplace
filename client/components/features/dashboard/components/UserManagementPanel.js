"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TablePagination from "@/components/ui/TablePagination";
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
const OWNER_ALLOWED_ROLES = new Set(["editor", "approver"]);
const PAGE_SIZE = 10;

export default function UserManagementPanel({ mode = "owner" }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState({
    id: null,
    email: "",
    first_name: "",
    last_name: "",
    role: "viewer",
    is_active: true,
    business_id: "",
  });
  const [businessSearch, setBusinessSearch] = useState("");
  const [editBusinessSearch, setEditBusinessSearch] = useState("");
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [page, setPage] = useState(1);
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
  const suspendUserMutation = useMutation({
    mutationFn: businessService.suspendUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-users"] }),
  });
  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => businessService.updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-users"] }),
  });
  const activateUserMutation = useMutation({
    mutationFn: businessService.activateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-users"] }),
  });
  const deleteUserMutation = useMutation({
    mutationFn: businessService.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-users"] }),
  });
  const businessesQuery = useQuery({
    queryKey: ["businesses"],
    queryFn: businessService.listBusinesses,
    enabled: mode === "admin",
    staleTime: 60_000,
  });

  const businesses = Array.isArray(businessesQuery.data)
    ? businessesQuery.data
    : businessesQuery.data?.results || [];
  const businessLabelToId = useMemo(
    () => new Map(businesses.map((business) => [business.name, String(business.id)])),
    [businesses],
  );
  const businessIdToName = useMemo(
    () => new Map(businesses.map((business) => [String(business.id), business.name])),
    [businesses],
  );

  const onCreate = async () => {
    try {
      if (mode !== "admin" && !OWNER_ALLOWED_ROLES.has(form.role)) {
        notify.warning("Business owners can only create editor/approver users.");
        return;
      }

      const roleToCreate = mode === "admin" ? form.role : form.role;

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
        if (mode === "admin" && (form.role === "editor" || form.role === "approver") && !form.business_id) {
          notify.warning("Please select a business from the list");
          return;
        }

        const payload =
          mode === "admin"
            ? {
                email: form.email,
                password: form.password,
                role: roleToCreate,
                business_id:
                  roleToCreate === "editor" || roleToCreate === "approver"
                    ? form.business_id
                      ? Number(form.business_id)
                      : undefined
                    : undefined,
              }
            : {
                email: form.email,
                password: form.password,
                role: roleToCreate,
              };

        await createMutation.mutateAsync(payload);
      }

      notify.success("User created successfully");
      setForm(initialForm);
      setBusinessSearch("");
      setOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const users = Array.isArray(usersQuery.data)
    ? usersQuery.data
    : usersQuery.data?.results || [];
  const pages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const pagedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage((current) => Math.min(current, pages));
  }, [pages]);

  const onSuspendUser = async (user) => {
    if (!user?.id) return;
    try {
      await suspendUserMutation.mutateAsync(user.id);
      notify.success("User suspended");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const onActivateUser = async (user) => {
    if (!user?.id) return;
    try {
      await activateUserMutation.mutateAsync(user.id);
      notify.success("User activated");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const onDeleteUser = async (user) => {
    if (!user?.id) return;
    setDeleteUserTarget(user);
  };

  const onConfirmDeleteUser = async () => {
    if (!deleteUserTarget?.id) return;
    try {
      await deleteUserMutation.mutateAsync(deleteUserTarget.id);
      notify.success("User deleted");
      setDeleteUserTarget(null);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const openEditUser = (user) => {
    setEditForm({
      id: user.id,
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role,
      is_active: user.is_active,
      business_id: user.business_id ? String(user.business_id) : "",
    });
    setEditBusinessSearch(user.business_name || (user.business_id ? `Business #${user.business_id}` : ""));
    setEditOpen(true);
  };

  const onSaveUserEdit = async () => {
    if (!editForm.id) return;
    if (["editor", "approver", "business_owner"].includes(editForm.role) && !editForm.business_id) {
      notify.warning("Please select a business for this role.");
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: editForm.id,
        payload: {
          email: editForm.email,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          role: editForm.role,
          is_active: editForm.is_active,
          business_id:
            editForm.role === "admin" || editForm.role === "viewer"
              ? null
              : editForm.business_id
                ? Number(editForm.business_id)
                : null,
        },
      });
      notify.success("User updated");
      setEditOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

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
              {mode === "admin" ? <th className="px-3 py-2 text-right font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading ? (
              <tr className="border-t border-[#efe9d7]">
                <td colSpan={mode === "admin" ? 5 : 3} className="px-3 py-4 text-center text-[#6f6c63]">
                  Loading users...
                </td>
              </tr>
            ) : null}
            {pagedUsers.map((user) => (
              <tr key={user.id} className="border-t border-[#efe9d7]">
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2 capitalize">{user.role}</td>
                {mode === "admin" ? (
                  <td className="px-3 py-2">
                    {user.business_id
                      ? businessIdToName.get(String(user.business_id)) || `Business #${user.business_id}`
                      : "-"}
                  </td>
                ) : null}
                <td className="px-3 py-2">{user.is_active ? "Active" : "Inactive"}</td>
                {mode === "admin" ? (
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditUser(user)}
                        disabled={user.role === "admin" || updateUserMutation.isPending}
                        className="rounded-lg border border-[#d6d0be] px-2.5 py-1 text-xs font-medium text-[#211f1a] hover:bg-[#f1eee2] disabled:opacity-60"
                      >
                        Edit
                      </button>
                      {user.is_active ? (
                        <button
                          type="button"
                          onClick={() => onSuspendUser(user)}
                          disabled={user.role === "admin" || suspendUserMutation.isPending}
                          className="rounded-lg border border-amber-400 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onActivateUser(user)}
                          disabled={user.role === "admin" || activateUserMutation.isPending}
                          className="rounded-lg border border-emerald-500 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        disabled={user.role === "admin" || deleteUserMutation.isPending}
                        className="rounded-lg border border-rose-500 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            {!usersQuery.isLoading && !users.length ? (
              <tr className="border-t border-[#efe9d7]">
                <td colSpan={mode === "admin" ? 5 : 3} className="px-3 py-4 text-center text-[#6f6c63]">
                  No users found.
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
                    onChange={(e) => {
                      const nextRole = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        role: nextRole,
                        business_id: nextRole === "editor" || nextRole === "approver" ? prev.business_id : "",
                      }));
                      if (nextRole !== "editor" && nextRole !== "approver") {
                        setBusinessSearch("");
                      }
                    }}
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

          {mode === "admin" && (form.role === "editor" || form.role === "approver") ? (
            <label className="block">
              <span className="mb-1 block text-sm text-[#211f1a]">Business</span>
              <input
                list="business-options"
                value={businessSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setBusinessSearch(value);
                  setForm((prev) => ({ ...prev, business_id: businessLabelToId.get(value) || "" }));
                }}
                placeholder={businessesQuery.isLoading ? "Loading businesses..." : "Search and select business"}
                className="w-full rounded-lg border border-[#d6d0be] px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
              />
              <datalist id="business-options">
                {businesses.map((business) => (
                  <option key={business.id} value={business.name} />
                ))}
              </datalist>
              <span className="mt-1 block text-xs text-[#6f6c63]">
                Required for editor/approver accounts. Start typing to search.
              </span>
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
      <ConfirmDialog
        open={Boolean(deleteUserTarget)}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteUserTarget?.email || "this user"}"?`}
        confirmLabel="Delete"
        pending={deleteUserMutation.isPending}
        onCancel={() => setDeleteUserTarget(null)}
        onConfirm={onConfirmDeleteUser}
      />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit User">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Email</span>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-[#211f1a]">First Name</span>
              <input
                value={editForm.first_name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, first_name: e.target.value }))}
                className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[#211f1a]">Last Name</span>
              <input
                value={editForm.last_name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, last_name: e.target.value }))}
                className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Role</span>
            <select
              value={editForm.role}
              onChange={(e) => {
                const nextRole = e.target.value;
                setEditForm((prev) => ({
                  ...prev,
                  role: nextRole,
                  business_id:
                    nextRole === "admin" || nextRole === "viewer" ? "" : prev.business_id,
                }));
                if (nextRole === "admin" || nextRole === "viewer") {
                  setEditBusinessSearch("");
                }
              }}
              className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            >
              {["admin", "business_owner", "editor", "approver", "viewer"].map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          {["editor", "approver", "business_owner"].includes(editForm.role) ? (
            <label className="block">
              <span className="mb-1 block text-sm text-[#211f1a]">Business</span>
              <input
                list="edit-business-options"
                value={editBusinessSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditBusinessSearch(value);
                  setEditForm((prev) => ({ ...prev, business_id: businessLabelToId.get(value) || "" }));
                }}
                placeholder={businessesQuery.isLoading ? "Loading businesses..." : "Search and select business"}
                className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
              />
              <datalist id="edit-business-options">
                {businesses.map((business) => (
                  <option key={business.id} value={business.name} />
                ))}
              </datalist>
            </label>
          ) : null}

          <label className="inline-flex items-center gap-2 text-sm text-[#211f1a]">
            <input
              type="checkbox"
              checked={editForm.is_active}
              onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            Active
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
              onClick={onSaveUserEdit}
              disabled={updateUserMutation.isPending}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47] disabled:opacity-60"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
