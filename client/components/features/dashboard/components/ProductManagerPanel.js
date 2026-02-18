"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import { useProductsQuery } from "@/components/features/products/hooks/useProductsQuery";
import { useProductMutations } from "@/components/features/products/hooks/useProductMutations";
import { useNotify } from "@/hooks/useNotify";

const emptyForm = { name: "", description: "", price: "" };

export default function ProductManagerPanel({ mode }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const notify = useNotify();
  const productsQuery = useProductsQuery({ page, status });
  const mutations = useProductMutations({ page, status });

  const canCreate = mode === "admin" || mode === "owner" || mode === "editor";
  const canEdit = canCreate;
  const canSubmit = canCreate;
  const canDelete = mode === "admin";
  const canApprove = mode === "admin" || mode === "approver";

  const rows = productsQuery.data?.results || [];
  const totalCount = productsQuery.data?.count || 0;
  const pages = Math.max(1, Math.ceil(totalCount / 20));

  const loading =
    productsQuery.isLoading ||
    mutations.create.isPending ||
    mutations.update.isPending ||
    mutations.approve.isPending ||
    mutations.submit.isPending ||
    mutations.remove.isPending;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description, price: item.price });
    setDialogOpen(true);
  };

  const onSave = async () => {
    try {
      if (!form.name || Number(form.price) <= 0) {
        notify.warning("Please provide a valid name and price");
        return;
      }

      if (editing) {
        await mutations.update.mutateAsync({ id: editing.id, payload: form });
        notify.success("Product updated successfully");
      } else {
        await mutations.create.mutateAsync(form);
        notify.success("Product created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      notify.error(error.message);
    }
  };

  const submitForApproval = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    try {
      await mutations.submit.mutateAsync(id);
      notify.info("Product submitted for approval");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const approveProduct = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    try {
      await mutations.approve.mutateAsync(id);
      notify.success("Product approved");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    if (!window.confirm("Delete this product?")) return;
    try {
      await mutations.remove.mutateAsync(id);
      notify.success("Product deleted");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const statusColor = useMemo(
    () => ({ draft: "default", pending_approval: "warning", approved: "success" }),
    [],
  );

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" mb={2}>
        <Typography variant="h6">Product Management</Typography>
        <Stack direction="row" spacing={1}>
          <ToggleButtonGroup
            size="small"
            value={status}
            exclusive
            onChange={(_event, value) => {
              setStatus(value ?? "");
              setPage(1);
            }}
          >
            <ToggleButton value="">All</ToggleButton>
            <ToggleButton value="draft">Draft</ToggleButton>
            <ToggleButton value="pending_approval">Pending</ToggleButton>
            <ToggleButton value="approved">Approved</ToggleButton>
          </ToggleButtonGroup>

          {canCreate ? (
            <Button variant="contained" onClick={openCreate}>
              Create Product
            </Button>
          ) : null}
        </Stack>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Price</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Chip size="small" label={row.status} color={statusColor[row.status] || "default"} />
              </TableCell>
              <TableCell>${Number(row.price).toFixed(2)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {canEdit ? (
                    <Button size="small" variant="outlined" onClick={() => openEdit(row)} disabled={!row?.id}>
                      Edit
                    </Button>
                  ) : null}
                  {canSubmit ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => submitForApproval(row.id)}
                      disabled={!row?.id || row.status !== "draft"}
                    >
                      Submit
                    </Button>
                  ) : null}
                  {canApprove ? (
                    <Button
                      size="small"
                      color="success"
                      variant="outlined"
                      onClick={() => approveProduct(row.id)}
                      disabled={!row?.id}
                    >
                      Approve
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => deleteProduct(row.id)} disabled={!row?.id}>
                      Delete
                    </Button>
                  ) : null}
                </Stack>
              </TableCell>
            </TableRow>
          ))}

          {!rows.length && !productsQuery.isLoading ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No products available.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <Stack alignItems="center" mt={2}>
        <Pagination page={page} onChange={(_e, value) => setPage(value)} count={pages} color="primary" />
      </Stack>

      {dialogOpen ? (
        <Card sx={{ mt: 2, border: "1px solid", borderColor: "divider" }} elevation={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editing ? "Edit Product" : "Create Product"}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="Price"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              fullWidth
              type="number"
            />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={onSave} variant="contained" disabled={loading}>
                  Save
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Box>
  );
}
