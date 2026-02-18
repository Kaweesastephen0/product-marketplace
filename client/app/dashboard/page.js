"use client";

import { useRouter } from "next/navigation";
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
      <div className="grid min-h-screen place-items-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#d9d2bf] border-t-[#176c55]" />
      </div>
    );
  }

  if (!isAuthenticated || role === "viewer") {
    return null;
  }

  const content = (() => {
    if (role === "admin") return <AdminPanel section={active} />;
    if (role === "business_owner") return <OwnerPanel section={active} />;
    if (role === "editor") return <EditorPanel />;
    if (role === "approver") return <ApproverPanel />;
    return (
      <div className="rounded-2xl border border-[#ded9cb] bg-white p-4 text-sm text-[#211f1a]">Unsupported role.</div>
    );
  })();

  return (
    <div className="min-h-screen pb-9">
      <div className="flex">
        <HoverSidebar
          items={menu}
          activeKey={active}
          onSelect={setActive}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <AppHeader
            title="Role-Based Dashboard"
            subtitle="Secure product marketplace operations"
            user={user}
            onOpenSidebar={() => setMobileOpen(true)}
            onLogout={handleLogout}
          />

          <div className="p-2 sm:p-4">{content}</div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
