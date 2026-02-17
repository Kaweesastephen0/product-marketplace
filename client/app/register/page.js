"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

import AppFooter from "@/components/layout/AppFooter";
import { useNotify } from "@/hooks/useNotify";
import { authService } from "@/services/auth.service";

export default function ViewerRegistrationPage() {
  const notify = useNotify();
  const [form, setForm] = useState({ email: "", password: "", business_id: "" });
  const registration = useMutation({ mutationFn: authService.registerViewer });

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await registration.mutateAsync({ ...form, business_id: Number(form.business_id) });
      notify.success("Viewer account created successfully");
      setForm({ email: "", password: "", business_id: "" });
    } catch (error) {
      notify.error(error.message || "Registration failed");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, pb: 8 }}>
      <Card sx={{ width: "100%", maxWidth: 520 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Viewer Registration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register as a viewer to browse approved products.
          </Typography>

          <Stack component="form" spacing={2} mt={3} onSubmit={onSubmit}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            <TextField
              label="Business ID"
              type="number"
              value={form.business_id}
              onChange={(e) => setForm((prev) => ({ ...prev, business_id: e.target.value }))}
              required
              helperText="Ask your organization for business ID"
            />
            <Button type="submit" variant="contained" disabled={registration.isPending}>
              {registration.isPending ? "Registering..." : "Register"}
            </Button>
          </Stack>

          <Button component={Link} href="/login" size="small" sx={{ mt: 2 }}>
            Back to Login
          </Button>
        </CardContent>
      </Card>
      <AppFooter compact />
    </Box>
  );
}
