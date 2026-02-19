"use client";

import { useQuery } from "@tanstack/react-query";

import MetricCards from "@/components/dashboard/MetricCards";
import ProductManagerPanel from "@/components/dashboard/ProductManagerPanel";
import UserManagementPanel from "@/components/dashboard/UserManagementPanel";
import { businessService } from "@/lib/services/business.service";

// Renders owner metrics plus user and product management sections.
export default function OwnerPanel({ section = "overview" }) {
  const statsQuery = useQuery({ queryKey: ["business-stats"], queryFn: businessService.statistics });
  const stats = statsQuery.data || {};

  return (
    <div className="space-y-4">
      {(section === "overview" || section === "users") && (
        <MetricCards
          items={[
            { label: "Business Users", value: stats.total_business_users ?? "-" },
            { label: "Total Products", value: stats.total_products ?? "-" },
            { label: "Pending Approvals", value: stats.pending_approvals ?? "-" },
            { label: "Approved Products", value: stats.approved_products ?? "-" },
            { label: "Rejected Products", value: stats.rejected_products ?? "-" },
          ]}
        />
      )}

      {section === "users" ? (
        <section className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
          <UserManagementPanel />
        </section>
      ) : null}

      {section === "products" || section === "overview" ? (
        <section className="rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
          <ProductManagerPanel mode="owner" />
        </section>
      ) : null}
    </div>
  );
}
