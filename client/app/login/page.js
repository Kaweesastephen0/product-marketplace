"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

import AppFooter from "@/components/layout/AppFooter";
import { useNotify } from "@/hooks/useNotify";
import { authService } from "@/lib/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const notify = useNotify();
  const [form, setForm] = useState({ email: "", password: "" });

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
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, pb: 8 }}>
      <Card sx={{ width: "100%", maxWidth: 440 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Product Marketplace
          </Typography>
          <Typography variant="h4" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary">
            One login for Admin, Owner, Editor, Approver, and Viewer users.
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
            <Button type="submit" variant="contained" disabled={login.isPending}>
              {login.isPending ? "Signing In..." : "Login"}
            </Button>
          </Stack>

          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button component={Link} href="/" size="small">
              Public Products
            </Button>
            <Button component={Link} href="/register" size="small">
              Viewer Registration
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <AppFooter compact />
    </Box>
  );
}
