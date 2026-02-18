import api from "@/lib/axios";

function assertValidProductId(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("Invalid product id");
  }
  return numericId;
}

export const productsService = {
  async list({ page = 1, status } = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (status) params.set("status", status);
    const { data } = await api.get(`/api/products?${params.toString()}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/api/products", payload);
    return data;
  },
  async update(id, payload) {
    const productId = assertValidProductId(id);
    const { data } = await api.patch(`/api/products/${productId}`, payload);
    return data;
  },
  async approve(id) {
    const productId = assertValidProductId(id);
    const { data } = await api.post(`/api/products/${productId}/approve`, {});
    return data;
  },
  async reject(id) {
    const productId = assertValidProductId(id);
    const { data } = await api.post(`/api/products/${productId}/reject`, {});
    return data;
  },
  async submit(id) {
    const productId = assertValidProductId(id);
    const { data } = await api.post(`/api/products/${productId}/submit`, {});
    return data;
  },
  async remove(id) {
    const productId = assertValidProductId(id);
    const { data } = await api.delete(`/api/products/${productId}`);
    return data;
  },
};
