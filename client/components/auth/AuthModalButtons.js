"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import IconInput from "@/components/ui/IconInput";
import Modal from "@/components/ui/Modal";
import { useNotify } from "@/hooks/useNotify";
import { authService } from "@/lib/services/auth.service";

// Renders auth actions and profile modal controls in the public header.
export default function AuthModalButtons() {
  const router = useRouter();
  const notify = useNotify();
  const queryClient = useQueryClient();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", business_id: "" });
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const meQuery = useQuery({
    queryKey: ["header-me"],
    queryFn: authService.me,
    retry: false,
    staleTime: 30_000,
  });
  const login = useMutation({ mutationFn: authService.login });
  const register = useMutation({ mutationFn: authService.registerViewer });
  const logout = useMutation({ mutationFn: authService.logout });
  const updateProfile = useMutation({ mutationFn: authService.updateProfile });

  const isAuthenticated = Boolean(meQuery.data?.email);

  useEffect(() => {
    if (profileOpen) {
      setProfileForm({
        first_name: meQuery.data?.first_name || "",
        last_name: meQuery.data?.last_name || "",
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    }
  }, [profileOpen, meQuery.data]);

  // Runs the login event handler.
  const onLogin = async (event) => {
    event.preventDefault();
    try {
      await login.mutateAsync(loginForm);
      notify.success("Login successful");
      await meQuery.refetch();
      setLoginOpen(false);
      router.replace("/dashboard");
    } catch (error) {
      notify.error(error.message || "Login failed");
    }
  };

  // Runs the register event handler.
  const onRegister = async (event) => {
    event.preventDefault();
    try {
      await register.mutateAsync({ ...registerForm, business_id: Number(registerForm.business_id) });
      notify.success("Viewer account created successfully");
      setRegisterForm({ email: "", password: "", business_id: "" });
      setRegisterOpen(false);
    } catch (error) {
      notify.error(error.message || "Registration failed");
    }
  };

  // Runs the logout event handler.
  const onLogout = async () => {
    try {
      await logout.mutateAsync();
      queryClient.removeQueries({ queryKey: ["header-me"] });
      queryClient.removeQueries({ queryKey: ["me"] });
      setLoginOpen(false);
      setRegisterOpen(false);
      setProfileOpen(false);
      notify.info("Logged out");
      router.refresh();
    } catch (error) {
      notify.error(error.message || "Logout failed");
    }
  };

  // Runs the save profile event handler.
  const onSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
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
      await meQuery.refetch();
      notify.success("Profile updated");
      setProfileOpen(false);
    } catch (error) {
      notify.error(error.message || "Failed to update profile");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {meQuery.isLoading ? (
          <div className="h-9 w-40 animate-pulse rounded-lg bg-[#ece8dc]" />
        ) : isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm text-[#2a2823] hover:bg-[#f1eee2]"
            >
              <PersonOutlineOutlined fontSize="small" />
              Profile
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={logout.isPending}
              className="inline-flex items-center gap-1 rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47] disabled:opacity-60"
            >
              <LogoutOutlined fontSize="small" />
              {logout.isPending ? "Logging out..." : "Logout"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="rounded-lg px-3 py-1.5 text-sm text-[#176c55] hover:bg-[#f1eee2]"
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47]"
            >
              Login
            </button>
          </>
        )}
      </div>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Sign In" maxWidthClass="max-w-md">
        <form onSubmit={onLogin} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Email</span>
            <IconInput
              icon={EmailOutlined}
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Password</span>
            <IconInput
              icon={LockOutlined}
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setLoginOpen(false)}
              className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={login.isPending}
              className="rounded-lg bg-[#176c55] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#135a47] disabled:opacity-60"
            >
              {login.isPending ? "Signing In..." : "Login"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title="Viewer Registration" maxWidthClass="max-w-lg">
        <form onSubmit={onRegister} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Email</span>
            <IconInput
              icon={EmailOutlined}
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Password</span>
            <IconInput
              icon={LockOutlined}
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Business ID</span>
            <IconInput
              icon={BusinessOutlined}
              type="number"
              value={registerForm.business_id}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, business_id: e.target.value }))}
              required
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRegisterOpen(false)}
              className="rounded-lg border border-[#d6d0be] px-3 py-1.5 text-sm hover:bg-[#f1eee2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={register.isPending}
              className="rounded-lg bg-[#176c55] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#135a47] disabled:opacity-60"
            >
              {register.isPending ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </Modal>

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
              <p className="m-0 mt-1 text-sm text-[#211f1a]">{meQuery.data?.email || "-"}</p>
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
              onClick={onSaveProfile}
              disabled={updateProfile.isPending}
              className="rounded-lg bg-[#176c55] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#135a47] disabled:opacity-60"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
