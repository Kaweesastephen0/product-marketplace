"use client";

import { useQuery } from "@tanstack/react-query";

import { productsService } from "@/lib/services/products.service";

// Fetches paginated products for the active page and status filter.
export function useProductsQuery({ page, status }) {
  return useQuery({
    queryKey: ["products", page, status || "all"],
    queryFn: () => productsService.list({ page, status }),
    placeholderData: (oldData) => oldData,
  });
}
