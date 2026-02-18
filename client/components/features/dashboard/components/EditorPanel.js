"use client";

import ProductManagerPanel from "@/components/features/dashboard/components/ProductManagerPanel";

export default function EditorPanel() {
  return (
    <section className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
      <ProductManagerPanel mode="editor" />
    </section>
  );
}
