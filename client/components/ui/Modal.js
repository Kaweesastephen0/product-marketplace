"use client";

import { useEffect } from "react";

// Renders a closable modal with scrollable content and escape key handling.
export default function Modal({ open, onClose, title, children, maxWidthClass = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return undefined;

    // Runs the key down event handler.
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-1400 flex items-start justify-center overflow-y-auto bg-black/45 p-4 sm:items-center"
      onClick={onClose}
      role="button"
      tabIndex={-1}
    >
      <div
        className={`my-4 flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-2xl border border-[#ded9cb] bg-white p-5 shadow-xl ${maxWidthClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="m-0 text-lg font-semibold text-[#211f1a]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-[#6f6c63] hover:bg-[#f1eee2]"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
        <div className="overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
