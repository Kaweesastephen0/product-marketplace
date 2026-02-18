"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { useNotify } from "@/hooks/useNotify";
import { authService } from "@/lib/services/auth.service";

// Renders the page component UI.
export default function ProfilePage() {
  const router = useRouter();
  const notify = useNotify();
  const { user, isLoading, isAuthenticated, clearAuthCache } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

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

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#d9d2bf] border-t-[#176c55]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        title="My Profile"
        subtitle="View your account details"
        user={user}
        onOpenSidebar={() => {}}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 p-3 sm:p-5">
        <section className="rounded-2xl border border-[#ded9cb] bg-white p-5 shadow-sm">
          <h2 className="m-0 mb-4 text-lg font-semibold text-[#211f1a]">Account Details</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">First Name</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{user?.first_name || "-"}</p>
            </div>
            <div>
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Last Name</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{user?.last_name || "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Email</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{user?.email || "-"}</p>
            </div>
            <div>
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Role</p>
              <p className="m-0 mt-1 text-sm capitalize text-[#211f1a]">{(user?.role || "-").replace("_", " ")}</p>
            </div>
            <div>
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Status</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{user?.is_active ? "Active" : "Suspended"}</p>
            </div>
            <div>
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Business</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{user?.business_name || "-"}</p>
            </div>
            <div>
              <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Business ID</p>
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{user?.business_id ?? "-"}</p>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
