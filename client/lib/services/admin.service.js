import api from "@/lib/axios";

export const adminService = {
  // Performs statistics operations.
  async statistics() {
    const { data } = await api.get("/api/admin/statistics");
    return data;
  },
  // Performs list businesses operations.
  async listBusinesses(page = 1) {
    const { data } = await api.get(`/api/businesses?page=${page}`);
    return data;
  },
  // Performs update business operations.
  async updateBusiness(id, payload) {
    const { data } = await api.patch(`/api/businesses/${id}`, payload);
    return data;
  },
  // Performs delete business operations.
  async deleteBusiness(id) {
    const { data } = await api.delete(`/api/businesses/${id}`);
    return data;
  },
  // Performs create business owner operations.
  async createBusinessOwner(payload) {
    const { data } = await api.post("/api/create-business-owner", payload);
    return data;
  },
};
