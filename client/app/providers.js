"use client";

import { useEffect, useMemo, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import { AuthProvider } from "@/hooks/useAuth";
import { NotifyProvider } from "@/hooks/useNotify";
import { makeQueryClient } from "@/lib/query-client";

export default function Providers({ children }) {
  const [queryClient] = useState(() => makeQueryClient());

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: { main: "#176c55" },
          secondary: { main: "#394867" },
          background: { default: "#f5f4ef", paper: "#ffffff" },
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
        },
      }),
    [],
  );

  useEffect(() => {
    const handler = () => {
      queryClient.removeQueries({ queryKey: ["me"] });
      if (window.location.pathname.startsWith("/dashboard")) {
        window.location.href = "/login";
      }
    };
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [queryClient]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <NotifyProvider>
          <AuthProvider>{children}</AuthProvider>
        </NotifyProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
