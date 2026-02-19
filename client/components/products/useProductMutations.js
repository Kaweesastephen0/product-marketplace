"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { refreshDashboardData } from "@/lib/dashboard-refresh";
import { productsService } from "@/lib/services/products.service";

// Provides product create, update, submit, approve, reject, and delete mutations.
export function useProductMutations({ page, status }) {
  const queryClient = useQueryClient();
  const key = ["products", page, status || "all"];

  const refreshProducts = () => refreshDashboardData(queryClient, { products: true });

  const create = useMutation({
    mutationFn: productsService.create,
    onSuccess: refreshProducts,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => productsService.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      if (previous?.results) {
        queryClient.setQueryData(key, {
          ...previous,
          results: previous.results.map((item) => (item.id === id ? { ...item, ...payload } : item)),
        });
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: refreshProducts,
  });

  const approve = useMutation({
    mutationFn: productsService.approve,
    onSuccess: refreshProducts,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => productsService.reject(id, reason),
    onSuccess: refreshProducts,
  });

  const submit = useMutation({
    mutationFn: productsService.submit,
    onSuccess: refreshProducts,
  });

  const remove = useMutation({
    mutationFn: productsService.remove,
    onSuccess: refreshProducts,
  });

  return { create, update, approve, reject, submit, remove };
}
