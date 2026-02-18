"use client";

export default function TablePagination({ page, totalPages, onPrev, onNext, className = "" }) {
  return (
    <div className={`mt-3 flex items-center justify-center gap-2 text-sm ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1}
        className="rounded-lg border border-[#d6d0be] px-3 py-1 hover:bg-[#f1eee2] disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-[#6f6c63]">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-lg border border-[#d6d0be] px-3 py-1 hover:bg-[#f1eee2] disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
