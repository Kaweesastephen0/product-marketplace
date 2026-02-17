"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Stack } from "@mui/material";

import MetricCards from "@/features/dashboard/components/MetricCards";
import ProductManagerPanel from "@/features/dashboard/components/ProductManagerPanel";
import UserManagementPanel from "@/features/dashboard/components/UserManagementPanel";
import { businessService } from "@/services/business.service";

export default function OwnerPanel({ section = "overview" }) {
  const statsQuery = useQuery({ queryKey: ["business-stats"], queryFn: businessService.statistics });
  const stats = statsQuery.data || {};

  return (
    <Stack spacing={2.5}>
      {(section === "overview" || section === "users") && (
        <MetricCards
          items={[
            { label: "Business Users", value: stats.total_business_users ?? "-" },
            { label: "Total Products", value: stats.total_products ?? "-" },
            { label: "Pending Approvals", value: stats.pending_approvals ?? "-" },
            { label: "Approved Products", value: stats.approved_products ?? "-" },
          ]}
        />
      )}

      {section === "users" && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <UserManagementPanel />
          </CardContent>
        </Card>
      )}

      {(section === "products" || section === "overview") && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <ProductManagerPanel mode="owner" />
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
