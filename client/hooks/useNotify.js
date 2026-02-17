"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotifyContext = createContext(null);

export function NotifyProvider({ children }) {
  const [state, setState] = useState({ open: false, severity: "info", message: "" });

  const value = useMemo(
    () => ({
      show(severity, message) {
        setState({ open: true, severity, message });
      },
      success(message) {
        setState({ open: true, severity: "success", message });
      },
      error(message) {
        setState({ open: true, severity: "error", message });
      },
      warning(message) {
        setState({ open: true, severity: "warning", message });
      },
      info(message) {
        setState({ open: true, severity: "info", message });
      },
    }),
    [],
  );

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3200}
        onClose={() => setState((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setState((prev) => ({ ...prev, open: false }))}
          severity={state.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  const context = useContext(NotifyContext);
  if (!context) throw new Error("useNotify must be used within NotifyProvider");
  return context;
}
