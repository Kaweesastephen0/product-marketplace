"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";

import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import HoverSidebar from "@/components/layout/HoverSidebar";
import AdminPanel from "@/components/dashboard/AdminPanel";
import ApproverPanel from "@/components/dashboard/ApproverPanel";
import EditorPanel from "@/components/dashboard/EditorPanel";
import OwnerPanel from "@/components/dashboard/OwnerPanel";
import IconInput from "@/components/ui/IconInput";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { useNotify } from "@/hooks/useNotify";
import { authService } from "@/lib/services/auth.service";
import { ROLE_NAVIGATION } from "@/types/navigation";

// Returns the default sidebar section key for the given role.
function selectDefaultSection(role) {
  return ROLE_NAVIGATION[role]?.[0]?.key || "overview";
}

// Renders the authenticated dashboard and role-based panel conten.
export default function DashboardPage() {
  const router = useRouter();
  const notify = useNotify();
  const { user, isLoading, isAuthenticated, clearAuthCache, refetchMe } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

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
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (role === "viewer") {
      router.replace("/");
    }
  }, [role, router]);

  useEffect(() => {
    if (profileOpen) {
      setProfileForm({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    }
  }, [profileOpen, user]);

  const updateProfileMutation = useMutation({ mutationFn: authService.updateProfile });

  // Logs the user out, clears cached auth state, and redirects to login.
  const handleLogout = async () => {
    try {
      await authService.logout();
      notify.info("Logged out");
    } catch {
      notify.warning("Session cleared");
    } finally {
      clearAuthCache();
      router.replace("/");
    }
  };

  // Saves profile changes, optionally updates password, and refreshes user data.
  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        ...(profileForm.new_password
          ? {
              current_password: profileForm.current_password,
              new_password: profileForm.new_password,
              confirm_new_password: profileForm.confirm_new_password,
            }
          : {}),
      });
      await refetchMe();
      notify.success("Profile updated");
      setProfileForm((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      }));
      setProfileOpen(false);
    } catch (error) {
      notify.error(error.message || "Failed to update profile");
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

  // Performs content operations.
  const content = (() => {
    if (role === "admin") return <AdminPanel section={active} />;
    if (role === "business_owner") return <OwnerPanel section={active} />;
    if (role === "editor") return <EditorPanel section={active} />;
    if (role === "approver") return <ApproverPanel section={active} />;
    return (
      <div className="rounded-2xl border border-[#ded9cb] bg-white p-4 text-sm text-[#211f1a]">Unsupported role.</div>
    );
  })();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-0 flex-1">
        <HoverSidebar
          items={menu}
          activeKey={active}
          onSelect={setActive}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            title="Dashboard"
            subtitle="Products marketplace dashboard"
            user={user}
            onOpenSidebar={() => setMobileOpen(true)}
            onLogout={handleLogout}
            onOpenProfile={() => setProfileOpen(true)}
          />

          <div className="flex-1 p-2 sm:p-4">{content}</div>
        </div>
      </div>

      <AppFooter />
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="My Profile" maxWidthClass="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-[#211f1a]">First Name</span>
              <IconInput
                icon={PersonOutlineOutlined}
                value={profileForm.first_name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[#211f1a]">Last Name</span>
              <IconInput
                icon={PersonOutlineOutlined}
                value={profileForm.last_name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Email</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{user?.email || "-"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#e3decf] p-3">
            <h3 className="m-0 text-sm font-semibold text-[#211f1a]">Change Password</h3>
            <div className="mt-2 space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-[#211f1a]">Current Password</span>
                <IconInput
                  icon={LockOutlined}
                  type="password"
                  value={profileForm.current_password}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, current_password: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-[#211f1a]">New Password</span>
                <IconInput
                  icon={LockOutlined}
                  type="password"
                  value={profileForm.new_password}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, new_password: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-[#211f1a]">Confirm New Password</span>
                <IconInput
                  icon={LockOutlined}
                  type="password"
                  value={profileForm.confirm_new_password}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, confirm_new_password: e.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setProfileOpen(false)}
              className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47] disabled:opacity-60"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
