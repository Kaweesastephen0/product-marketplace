"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import Modal from "@/components/ui/Modal";
import AppFooter from "@/components/layout/AppFooter";
import { useNotify } from "@/hooks/useNotify";
import { authService } from "@/lib/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const notify = useNotify();
  const [form, setForm] = useState({ email: "", password: "" });
  const [openModal, setOpenModal] = useState(true);

  const login = useMutation({ mutationFn: authService.login });

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await login.mutateAsync(form);
      notify.success("Login successful");
      router.replace("/dashboard");
    } catch (error) {
      notify.error(error.message || "Login failed");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 pb-10">
      <div className="w-full max-w-[440px] rounded-2xl border border-[#ded9cb] bg-white p-6 shadow-sm">
        <p className="m-0 text-xs uppercase tracking-wide text-[#6f6c63]">Product Marketplace</p>
        <h1 className="m-0 mt-2 text-3xl font-bold text-[#211f1a]">Sign In</h1>
        <p className="m-0 mt-1 text-sm text-[#6f6c63]">
          One login for Admin, Owner, Editor, Approver, and Viewer users.
        </p>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="mt-6 w-full rounded-lg bg-[#176c55] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#135a47]"
        >
          Open Sign In Form
        </button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link className="text-[#176c55] hover:underline" href="/">
            Public Products
          </Link>
          <Link className="text-[#176c55] hover:underline" href="/register">
            Viewer Registration
          </Link>
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Sign In" maxWidthClass="max-w-md">
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpenModal(false)}
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

      <AppFooter compact />
    </div>
  );
}
