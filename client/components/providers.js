"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { NotifyProvider } from "@/hooks/useNotify";
import { makeQueryClient } from "@/lib/query-client";

// Wraps app children with shared client-side providers.
export default function Providers({ children }) {
  const [queryClient] = useState(() => makeQueryClient());

  useEffect(() => {
    // Handles interaction.
    const handler = () => {
      queryClient.removeQueries({ queryKey: ["me"] });
      if (window.location.pathname.startsWith("/dashboard")) {
        window.location.href = "/";
      }
    };
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <NotifyProvider>
        <AuthProvider>{children}</AuthProvider>
      </NotifyProvider>
    </QueryClientProvider>
  );
}
