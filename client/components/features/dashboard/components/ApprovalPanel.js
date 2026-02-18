"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useProductsQuery } from "@/components/features/products/hooks/useProductsQuery";
import { useProductMutations } from "@/components/features/products/hooks/useProductMutations";
import { useNotify } from "@/hooks/useNotify";

export default function ApprovalPanel() {
  const [page, setPage] = useState(1);
  const notify = useNotify();
  const productsQuery = useProductsQuery({ page, status: "pending_approval" });
  const { approve, reject } = useProductMutations({ page, status: "pending_approval" });

  const rows = productsQuery.data?.results || [];
  const pages = Math.max(1, Math.ceil((productsQuery.data?.count || 0) / 20));

  const onApprove = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    try {
      await approve.mutateAsync(id);
      notify.success("Product approved");
    } catch (error) {
      notify.error(error.message);
    }
  };

  const onReject = async (id) => {
    if (!id) {
      notify.error("Invalid product id");
      return;
    }
    try {
      await reject.mutateAsync(id);
      notify.warning("Product rejected and moved to draft");
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Product Approvals
      </Typography>

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
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Chip size="small" label={row.status} color="warning" />
              </TableCell>
              <TableCell>${Number(row.price).toFixed(2)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="contained" color="success" onClick={() => onApprove(row.id)} disabled={!row?.id}>
                    Approve
                  </Button>
                  <Button size="small" variant="outlined" color="warning" onClick={() => onReject(row.id)} disabled={!row?.id}>
                    Reject
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}

          {!rows.length && !productsQuery.isLoading ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No products pending approval.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <Stack alignItems="center" mt={2}>
        <Pagination page={page} onChange={(_e, value) => setPage(value)} count={pages} color="primary" />
      </Stack>
    </Box>
  );
}
