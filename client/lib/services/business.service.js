import api from "@/lib/axios";

export const businessService = {
  // Performs statistics operations.
  async statistics() {
    const { data } = await api.get("/api/business/statistics");
    return data;
  },
  // Performs list users operations.
  async listUsers() {
    const { data } = await api.get("/api/users/");
    return data;
  },
  // Performs list businesses operations.
  async listBusinesses() {
    const { data } = await api.get("/api/businesses/");
    return data;
  },
  // Performs create user operations.
  async createUser(payload) {
    const { data } = await api.post("/api/users/", payload);
    return data;
  },
  // Performs update user operations.
  async updateUser(id, payload) {
    const { data } = await api.patch(`/api/users/${id}/`, payload);
    return data;
  },
  // Performs suspend user operations.
  async suspendUser(id) {
    const { data } = await api.patch(`/api/users/${id}/`, { is_active: false });
    return data;
  },
  // Performs activate user operations.
  async activateUser(id) {
    const { data } = await api.patch(`/api/users/${id}/`, { is_active: true });
    return data;
  },
  // Performs delete user operations.
  async deleteUser(id) {
    const { data } = await api.delete(`/api/users/${id}/`);
    return data;
  },
};
