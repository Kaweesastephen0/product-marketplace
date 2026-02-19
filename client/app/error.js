"use client";

// Renders the error component UI.
export default function GlobalError({ error, reset }) {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-130 rounded-2xl border border-[#ded9cb] bg-white p-5 shadow-sm">
        <h2 className="m-0 mb-2 text-lg font-semibold text-[#211f1a]">Something went wrong</h2>
        <p className="m-0 mb-4 text-sm text-[#6f6c63]">{error?.message || "Unexpected error"}</p>
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
