import api from "@/lib/axios";

// Validates that the given product id is a positive integer.
function assertValidProductId(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("Invalid product id");
  }
  return numericId;
}

export const productsService = {
  // Performs list operations.
  async list({ page = 1, status } = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (status) params.set("status", status);
    const { data } = await api.get(`/api/products?${params.toString()}`);
    return data;
  },
  // Performs create operations.
  async create(payload) {
    const requestBody = buildProductPayload(payload);
    const { data } = await api.post("/api/products", requestBody);
    return data;
  },
  // Performs update operations.
  async update(id, payload) {
    const productId = assertValidProductId(id);
    const requestBody = buildProductPayload(payload);
    const { data } = await api.patch(`/api/products/${productId}`, requestBody);
    return data;
  },
  // Performs approve operations.
  async approve(id) {
    const productId = assertValidProductId(id);
    const { data } = await api.post(`/api/products/${productId}/approve`, {});
    return data;
  },
  // Performs reject operations.
  async reject(id, reason) {
    const productId = assertValidProductId(id);
    const { data } = await api.post(`/api/products/${productId}/reject`, { reason });
    return data;
  },
  // Performs submit operations.
  async submit(id) {
    const productId = assertValidProductId(id);
    const { data } = await api.post(`/api/products/${productId}/submit`, {});
    return data;
  },
  // Performs remove operations.
  async remove(id) {
    const productId = assertValidProductId(id);
    const { data } = await api.delete(`/api/products/${productId}`);
    return data;
  },
};

// Builds FormData when an image file is included, otherwise returns JSON payload.
function buildProductPayload(payload = {}) {
  const hasFile = typeof File !== "undefined" && payload.image instanceof File;
  if (!hasFile) return payload;

  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === "") continue;
    formData.append(key, value);
  }
  return formData;
}
