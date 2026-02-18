"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const NotifyContext = createContext(null);

const toneStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

// Renders the useNotify component UI.
export function NotifyProvider({ children }) {
  const [state, setState] = useState({ open: false, severity: "info", message: "", id: 0 });

  // Performs push operations.
  const push = (severity, message) => {
    setState({ open: true, severity, message: message || "", id: Date.now() });
  };

  useEffect(() => {
    if (!state.open) return undefined;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, open: false }));
    }, 3200);
    return () => clearTimeout(timer);
  }, [state.open, state.id]);

  const value = useMemo(
    () => ({
      // Performs show operations.
      show(severity, message) {
        push(severity, message);
      },
      // Performs success operations.
      success(message) {
        push("success", message);
      },
      // Performs error operations.
      error(message) {
        push("error", message);
      },
      // Performs warning operations.
      warning(message) {
        push("warning", message);
      },
      // Performs info operations.
      info(message) {
        push("info", message);
      },
    }),
    [],
  );

  return (
    <NotifyContext.Provider value={value}>
      {children}

      {state.open ? (
        <div className="pointer-events-none fixed right-4 top-4 z-2000">
          <div
            role="status"
            className={`pointer-events-auto min-w-56 max-w-105 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toneStyles[state.severity] || toneStyles.info
            }`}
          >
            <div className="flex items-start gap-3">
              <p className="m-0 flex-1">{state.message}</p>
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, open: false }))}
                className="rounded px-1 text-base leading-none opacity-70 transition-opacity hover:opacity-100"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </NotifyContext.Provider>
  );
}

// Returns typed toast helpers for success, error, warning, and info messages.
export function useNotify() {
  const context = useContext(NotifyContext);
  if (!context) throw new Error("useNotify must be used within NotifyProvider");
  return context;
}
