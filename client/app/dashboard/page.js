"use client";

import { useRouter } from "next/navigation";
import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import HoverSidebar from "@/components/layout/HoverSidebar";
import AdminPanel from "@/components/features/dashboard/components/AdminPanel";
import ApproverPanel from "@/components/features/dashboard/components/ApproverPanel";
import EditorPanel from "@/components/features/dashboard/components/EditorPanel";
import OwnerPanel from "@/components/features/dashboard/components/OwnerPanel";
import { useAuth } from "@/hooks/useAuth";
import { useNotify } from "@/hooks/useNotify";
import { authService } from "@/lib/services/auth.service";
import { ROLE_NAVIGATION } from "@/types/navigation";

function selectDefaultSection(role) {
  return ROLE_NAVIGATION[role]?.[0]?.key || "overview";
}

export default function DashboardPage() {
  const router = useRouter();
  const notify = useNotify();
  const { user, isLoading, isAuthenticated, clearAuthCache } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role;
  const menu = useMemo(() => ROLE_NAVIGATION[role] || [], [role]);
  const [active, setActive] = useState(selectDefaultSection(role));

  useEffect(() => {
    if (role && !menu.find((item) => item.key === active)) {
      setActive(selectDefaultSection(role));
    }
  }, [role, menu, active]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (role === "viewer") {
      router.replace("/");
    }
  }, [role, router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      notify.info("Logged out");
    } catch {
      notify.warning("Session cleared");
    } finally {
      clearAuthCache();
      router.replace("/login");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (role === "viewer") {
    return null;
  }

  const content = (() => {
    if (role === "admin") return <AdminPanel section={active} />;
    if (role === "business_owner") return <OwnerPanel section={active} />;
    if (role === "editor") return <EditorPanel />;
    if (role === "approver") return <ApproverPanel />;
    return (
      <Card>
        <CardContent>
          <Typography>Unsupported role.</Typography>
        </CardContent>
      </Card>
    );
  })();

  return (
    <Box sx={{ minHeight: "100vh", pb: 9 }}>
      <Box sx={{ display: "flex" }}>
        <HoverSidebar
          items={menu}
          activeKey={active}
          onSelect={setActive}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <Box sx={{ flexGrow: 1 }}>
          <AppHeader
            title="Role-Based Dashboard"
            subtitle="Secure product marketplace operations"
            user={user}
            onOpenSidebar={() => setMobileOpen(true)}
            onLogout={handleLogout}
          />

          <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>{content}</Box>
        </Box>
      </Box>

      <AppFooter />
    </Box>
  );
}
