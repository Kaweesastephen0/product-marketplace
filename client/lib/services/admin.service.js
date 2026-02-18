import api from "@/lib/axios";

export const adminService = {
  async statistics() {
    const { data } = await api.get("/api/admin/statistics");
    return data;
  },
  async listBusinesses(page = 1) {
    const { data } = await api.get(`/api/businesses?page=${page}`);
    return data;
  },
  async updateBusiness(id, payload) {
    const { data } = await api.patch(`/api/businesses/${id}`, payload);
    return data;
  },
  async deleteBusiness(id) {
    const { data } = await api.delete(`/api/businesses/${id}`);
    return data;
  },
  async createBusinessOwner(payload) {
    const { data } = await api.post("/api/create-business-owner", payload);
    return data;
  },
};
