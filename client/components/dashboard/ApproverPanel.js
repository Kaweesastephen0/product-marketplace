"use client";

import { useQuery } from "@tanstack/react-query";

import ApprovalPanel from "@/components/dashboard/ApprovalPanel";
import MetricCards from "@/components/dashboard/MetricCards";
import { productsService } from "@/lib/services/products.service";

// Renders approver metrics and product approval management section.
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
  const rejectedQuery = useQuery({
    queryKey: ["approver-stats", "rejected"],
    queryFn: () => productsService.list({ page: 1, status: "rejected" }),
    staleTime: 30_000,
  });

  const pendingCount = pendingQuery.data?.count ?? "-";
  const approvedCount = approvedQuery.data?.count ?? "-";
  const rejectedCount = rejectedQuery.data?.count ?? "-";

  return (
    <div className="space-y-4">
      <MetricCards
        items={[
          { label: "Pending", value: pendingCount },
          { label: "Approved", value: approvedCount },
          { label: "Rejected", value: rejectedCount },
        ]}
      />

      <section className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
        <ApprovalPanel section={section} />
      </section>
    </div>
  );
}
