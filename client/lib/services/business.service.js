import api from "@/lib/axios";

export const businessService = {
  async statistics() {
    const { data } = await api.get("/api/business/statistics");
    return data;
  },
  async listUsers() {
    const { data } = await api.get("/api/users/");
    return data;
  },
  async listBusinesses() {
    const { data } = await api.get("/api/businesses/");
    return data;
  },
  async createUser(payload) {
    const { data } = await api.post("/api/users/", payload);
    return data;
  },
  async updateUser(id, payload) {
    const { data } = await api.patch(`/api/users/${id}/`, payload);
    return data;
  },
  async suspendUser(id) {
    const { data } = await api.patch(`/api/users/${id}/`, { is_active: false });
    return data;
  },
  async activateUser(id) {
    const { data } = await api.patch(`/api/users/${id}/`, { is_active: true });
    return data;
  },
  async deleteUser(id) {
    const { data } = await api.delete(`/api/users/${id}/`);
    return data;
  },
};
