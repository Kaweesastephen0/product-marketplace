import api from "@/lib/axios";

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
    const { data } = await api.patch(`/api/products/${id}`, payload);
    return data;
  },
  async approve(id) {
    const { data } = await api.post(`/api/products/${id}/approve`, {});
    return data;
  },
  async reject(id) {
    const { data } = await api.post(`/api/products/${id}/reject`, {});
    return data;
  },
  async submit(id) {
    const { data } = await api.post(`/api/products/${id}/submit`, {});
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/api/products/${id}`);
    return data;
  },
};
