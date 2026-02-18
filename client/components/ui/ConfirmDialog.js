"use client";

import Modal from "@/components/ui/Modal";

// Renders a confirmation modal with cancel and confirm actions.
export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  pending = false,
  onConfirm,
  onCancel,
}) {
  const confirmClass =
    confirmTone === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : confirmTone === "warning"
        ? "bg-amber-600 hover:bg-amber-700"
        : "bg-[#176c55] hover:bg-[#135a47]";

  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidthClass="max-w-md">
      <div className="space-y-4">
        <p className="m-0 text-sm text-[#211f1a]">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
