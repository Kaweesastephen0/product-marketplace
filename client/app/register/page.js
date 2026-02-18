"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import Modal from "@/components/ui/Modal";
import AppFooter from "@/components/layout/AppFooter";
import { useNotify } from "@/hooks/useNotify";
import { authService } from "@/lib/services/auth.service";

export default function ViewerRegistrationPage() {
  const notify = useNotify();
  const [form, setForm] = useState({ email: "", password: "", business_id: "" });
  const [openModal, setOpenModal] = useState(true);
  const registration = useMutation({ mutationFn: authService.registerViewer });

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await registration.mutateAsync({ ...form, business_id: Number(form.business_id) });
      notify.success("Viewer account created successfully");
      setForm({ email: "", password: "", business_id: "" });
      setOpenModal(false);
    } catch (error) {
      notify.error(error.message || "Registration failed");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 pb-10">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#ded9cb] bg-white p-6 shadow-sm">
        <h1 className="m-0 text-2xl font-bold text-[#211f1a]">Viewer Registration</h1>
        <p className="m-0 mt-1 text-sm text-[#6f6c63]">Register as a viewer to browse approved products.</p>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="mt-6 w-full rounded-lg bg-[#176c55] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#135a47]"
        >
          Open Registration Form
        </button>

        <Link className="mt-4 inline-block text-sm text-[#176c55] hover:underline" href="/login">
          Back to Login
        </Link>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Viewer Registration" maxWidthClass="max-w-lg">
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
          <label className="block">
            <span className="mb-1 block text-sm text-[#211f1a]">Business ID</span>
            <input
              type="number"
              value={form.business_id}
              onChange={(e) => setForm((prev) => ({ ...prev, business_id: e.target.value }))}
              required
              className="w-full rounded-lg border border-[#d6d0be] bg-white px-3 py-2 text-sm outline-none ring-[#176c55] focus:ring-2"
            />
            <span className="mt-1 block text-xs text-[#6f6c63]">Ask your organization for business ID</span>
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
              disabled={registration.isPending}
              className="rounded-lg bg-[#176c55] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#135a47] disabled:opacity-60"
            >
              {registration.isPending ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </Modal>

      <AppFooter compact />
    </div>
  );
}
