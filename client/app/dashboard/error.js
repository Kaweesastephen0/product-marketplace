"use client";

export default function DashboardError({ error, reset }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-2xl border border-[#ded9cb] bg-white p-5 shadow-sm">
        <h2 className="m-0 mb-2 text-lg font-semibold text-[#211f1a]">Dashboard error</h2>
        <p className="m-0 mb-4 text-sm text-[#6f6c63]">{error?.message || "Unable to load dashboard"}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#176c55] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#135a47]"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
