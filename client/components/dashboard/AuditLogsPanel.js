"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import IconInput from "@/components/ui/IconInput";
import TablePagination from "@/components/ui/TablePagination";
import { useNotify } from "@/hooks/useNotify";
import { adminService } from "@/lib/services/admin.service";

const PAGE_SIZE = 20;

// Renders the admin audit log table with filtering and delete actions.
export default function AuditLogsPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);

  const notify = useNotify();
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ["admin-audit-logs", page, search, action, targetType],
    queryFn: () => adminService.listAuditLogs({ page, search, action, target_type: targetType }),
    placeholderData: (oldData) => oldData,
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteAuditLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] }),
  });

  const clearMutation = useMutation({
    mutationFn: adminService.clearAuditLogs,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] }),
  });

  const rows = logsQuery.data?.results || [];
  const pages = Math.max(1, Math.ceil((logsQuery.data?.count || 0) / PAGE_SIZE));

  // Deletes a single audit log entry after confirmation.
  const onConfirmDeleteOne = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notify.success("Audit log deleted");
      setDeleteTarget(null);
    } catch (error) {
      notify.error(error.message);
    }
  };

  // Deletes all audit logs after confirmation.
  const onConfirmClear = async () => {
    try {
      const response = await clearMutation.mutateAsync();
      notify.success(`Cleared ${response?.deleted || 0} audit logs`);
      setClearOpen(false);
      setPage(1);
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <div>
      <div className="mb-3 grid grid-cols-1 items-center gap-2 lg:grid-cols-[1fr_auto_1fr]">
        <h2 className="m-0 text-xl font-semibold text-[#211f1a]">Audit Logs</h2>
        <div className="w-full lg:w-72 lg:justify-self-center">
          <IconInput
            icon={SearchOutlined}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by actor, action, target..."
            className="py-1.5 text-xs"
          />
        </div>
        <div className="flex items-center justify-start gap-2 lg:justify-self-end">
          <button
            type="button"
            onClick={() => setClearOpen(true)}
            disabled={clearMutation.isPending || !(logsQuery.data?.count > 0)}
            className="rounded-lg border border-rose-500 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d6d0be] bg-white px-3 py-1.5 text-sm outline-none ring-[#176c55] focus:ring-2"
        >
          <option value="">All actions</option>
          <option value="product_created">product_created</option>
          <option value="product_updated">product_updated</option>
          <option value="product_submitted">product_submitted</option>
          <option value="product_approved">product_approved</option>
          <option value="product_rejected">product_rejected</option>
          <option value="user_created">user_created</option>
          <option value="user_updated">user_updated</option>
          <option value="user_deleted">user_deleted</option>
        </select>

        <select
          value={targetType}
          onChange={(event) => {
            setTargetType(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-[#d6d0be] bg-white px-3 py-1.5 text-sm outline-none ring-[#176c55] focus:ring-2"
        >
          <option value="">All targets</option>
          <option value="product">product</option>
          <option value="user">user</option>
          <option value="business">business</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e3decf]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-[#f5f2e8] text-left text-[#4c493f]">
            <tr>
              <th className="px-3 py-2 font-medium">No.</th>
              <th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">Actor</th>
              <th className="px-3 py-2 font-medium">Business</th>
              <th className="px-3 py-2 font-medium">Target</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-t border-[#efe9d7]">
                <td className="px-3 py-2">{(page - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-3 py-2">{row.action}</td>
                <td className="px-3 py-2">{row.actor_email || "-"}</td>
                <td className="px-3 py-2">{row.business_name || "-"}</td>
                <td className="px-3 py-2">{row.target_type}:{row.target_id}</td>
                <td className="px-3 py-2">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg border border-rose-500 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!rows.length && !logsQuery.isLoading ? (
              <tr className="border-t border-[#efe9d7]">
                <td colSpan={7} className="px-3 py-4 text-center text-[#6f6c63]">
                  No audit logs found.
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Audit Log"
        message={`Delete audit log #${deleteTarget?.id}?`}
        confirmLabel="Delete"
        pending={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onConfirmDeleteOne}
      />

      <ConfirmDialog
        open={clearOpen}
        title="Clear Audit Logs"
        message="This will permanently delete all audit logs. Continue?"
        confirmLabel="Clear All"
        pending={clearMutation.isPending}
        onCancel={() => setClearOpen(false)}
        onConfirm={onConfirmClear}
      />
    </div>
  );
}
