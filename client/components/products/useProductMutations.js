"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productsService } from "@/lib/services/products.service";

// Provides product create, update, submit, approve, reject, and delete mutations.
export function useProductMutations({ page, status }) {
  const queryClient = useQueryClient();
  const key = ["products", page, status || "all"];

  const create = useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const approve = useMutation({
    mutationFn: productsService.approve,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => productsService.reject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const submit = useMutation({
    mutationFn: productsService.submit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const remove = useMutation({
    mutationFn: productsService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  return { create, update, approve, reject, submit, remove };
}
