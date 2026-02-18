"use client";

import { useQuery } from "@tanstack/react-query";

import ApprovalPanel from "@/components/features/dashboard/components/ApprovalPanel";
import MetricCards from "@/components/features/dashboard/components/MetricCards";
import { productsService } from "@/lib/services/products.service";

export default function ApproverPanel({ section = "pending" }) {
  const pendingQuery = useQuery({
    queryKey: ["approver-stats", "pending"],
    queryFn: () => productsService.list({ page: 1, status: "pending_approval" }),
    staleTime: 30_000,
  });
  const approvedQuery = useQuery({
    queryKey: ["approver-stats", "approved"],
    queryFn: () => productsService.list({ page: 1, status: "approved" }),
    staleTime: 30_000,
  });

  const pendingCount = pendingQuery.data?.count ?? "-";
  const approvedCount = approvedQuery.data?.count ?? "-";

  return (
    <div className="space-y-4">
      <MetricCards
        items={[
          { label: "Pending", value: pendingCount },
          { label: "Approved", value: approvedCount },
          { label: "Confirmed", value: approvedCount },
        ]}
      />

      <section className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
        <ApprovalPanel section={section} />
      </section>
    </div>
  );
}
