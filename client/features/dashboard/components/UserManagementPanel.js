"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { useNotify } from "@/hooks/useNotify";
import { adminService } from "@/services/admin.service";
import { businessService } from "@/services/business.service";

const initialForm = {
  email: "",
  password: "",
  role: "editor",
  business_id: "",
  business_name: "",
};

export default function UserManagementPanel({ mode = "owner" }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const notify = useNotify();
  const queryClient = useQueryClient();

  const usersQuery = useQuery({ queryKey: ["business-users"], queryFn: businessService.listUsers });

  const createMutation = useMutation({
    mutationFn: businessService.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-users"] }),
  });
  const createBusinessOwnerMutation = useMutation({
    mutationFn: adminService.createBusinessOwner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["business-users"] }),
  });

  const onCreate = async () => {
    try {
      if (mode === "admin" && form.role === "business_owner") {
        if (!form.business_name) {
          notify.warning("Business profile must be created first (business name is required)");
          return;
        }
        await createBusinessOwnerMutation.mutateAsync({
          business_name: form.business_name,
          owner_email: form.email,
          owner_password: form.password,
        });
      } else {
        const payload =
          mode === "admin"
            ? {
                email: form.email,
                password: form.password,
                role: form.role,
                business_id:
                  form.role === "admin"
                    ? undefined
                    : form.business_id
                      ? Number(form.business_id)
                      : undefined,
              }
            : {
                email: form.email,
                password: form.password,
                role: form.role,
              };

        await createMutation.mutateAsync(payload);
      }

      notify.success("User created successfully");
      setForm(initialForm);
      setOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const users = usersQuery.data || [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h6">User Management</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add User
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            {mode === "admin" ? <TableCell>Business</TableCell> : null}
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell sx={{ textTransform: "capitalize" }}>{user.role}</TableCell>
              {mode === "admin" ? <TableCell>{user.business_id ?? "-"}</TableCell> : null}
              <TableCell>{user.is_active ? "Active" : "Inactive"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {open ? (
        <Card sx={{ mt: 2, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create Business User
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Role
              </Typography>
              <RadioGroup
                row
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              >
              {mode === "admin" ? (
                <>
                  <FormControlLabel value="admin" control={<Radio size="small" />} label="Admin" />
                  <FormControlLabel
                    value="business_owner"
                    control={<Radio size="small" />}
                    label="Business Owner"
                  />
                  <FormControlLabel value="editor" control={<Radio size="small" />} label="Editor" />
                  <FormControlLabel value="approver" control={<Radio size="small" />} label="Approver" />
                  <FormControlLabel value="viewer" control={<Radio size="small" />} label="Viewer" />
                  </>
                ) : (
                  <>
                    <FormControlLabel value="editor" control={<Radio size="small" />} label="Editor" />
                    <FormControlLabel value="approver" control={<Radio size="small" />} label="Approver" />
                  </>
                )}
              </RadioGroup>
            </Box>

            {mode === "admin" && form.role === "business_owner" ? (
              <TextField
                label="Business Name"
                value={form.business_name}
                onChange={(e) => setForm((prev) => ({ ...prev, business_name: e.target.value }))}
                helperText="A new business profile will be created first, then owner account"
              />
            ) : null}

            {mode === "admin" && form.role !== "admin" && form.role !== "business_owner" ? (
              <TextField
                label="Business ID"
                type="number"
                value={form.business_id}
                onChange={(e) => setForm((prev) => ({ ...prev, business_id: e.target.value }))}
                helperText="Required for editor/approver/viewer accounts"
              />
            ) : null}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={onCreate}
                  variant="contained"
                  disabled={createMutation.isPending || createBusinessOwnerMutation.isPending}
                >
                  Create
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Box>
  );
}
