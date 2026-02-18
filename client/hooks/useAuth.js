"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authService } from "@/lib/services/auth.service";
import { hasPermission } from "@/types/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const shouldLoadProfile = pathname.startsWith("/dashboard");

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: authService.me,
    retry: false,
    enabled: shouldLoadProfile,
  });

  const value = useMemo(() => {
    const role = meQuery.data?.role || null;
    return {
      user: meQuery.data || null,
      role,
      isLoading: meQuery.isLoading,
      isAuthenticated: shouldLoadProfile ? Boolean(meQuery.data) : false,
      can(permission) {
        return hasPermission(role, permission);
      },
      async refetchMe() {
        return meQuery.refetch();
      },
      clearAuthCache() {
        queryClient.removeQueries({ queryKey: ["me"] });
      },
    };
  }, [meQuery, queryClient, shouldLoadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
