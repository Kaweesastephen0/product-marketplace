"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import MetricCards from "@/components/features/dashboard/components/MetricCards";
import ProductManagerPanel from "@/components/features/dashboard/components/ProductManagerPanel";
import UserManagementPanel from "@/components/features/dashboard/components/UserManagementPanel";
import { useNotify } from "@/hooks/useNotify";
import { adminService } from "@/lib/services/admin.service";

const initialForm = { business_name: "", owner_email: "", owner_password: "" };

export default function AdminPanel({ section = "overview" }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const notify = useNotify();
  const queryClient = useQueryClient();

  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: adminService.statistics });

  const createOwner = useMutation({
    mutationFn: adminService.createBusinessOwner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-stats"] }),
  });

  const onCreateOwner = async () => {
    try {
      await createOwner.mutateAsync(form);
      notify.success("Business owner created successfully");
      setForm(initialForm);
      setOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const stats = statsQuery.data || {};

  return (
    <Stack spacing={2.5}>
      {(section === "overview" || section === "businesses") && (
        <MetricCards
          items={[
            { label: "Total Businesses", value: stats.total_businesses ?? "-" },
            { label: "Total Users", value: stats.total_users ?? "-" },
            { label: "Total Products", value: stats.total_products ?? "-" },
            {
              label: "Approved / Pending",
              value: `${stats.approved_products ?? 0} / ${stats.pending_products ?? 0}`,
            },
          ]}
        />
      )}

      {section === "businesses" && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">Business Management</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create Business Owner accounts and expand marketplace coverage.
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => setOpen(true)}>
                Create Business Owner
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {(section === "products" || section === "overview") && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <ProductManagerPanel mode="admin" />
          </CardContent>
        </Card>
      )}

      {section === "users" && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <UserManagementPanel mode="admin" />
          </CardContent>
        </Card>
      )}

      {open ? (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create Business Owner
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <TextField
                label="Business Name"
                value={form.business_name}
                onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
              />
              <TextField
                label="Owner Email"
                value={form.owner_email}
                onChange={(e) => setForm((prev) => ({ ...prev, owner_email: e.target.value }))}
              />
              <TextField
                label="Owner Password"
                type="password"
                value={form.owner_password}
                onChange={(e) => setForm((prev) => ({ ...prev, owner_password: e.target.value }))}
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={onCreateOwner} disabled={createOwner.isPending}>
                  Create
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}
