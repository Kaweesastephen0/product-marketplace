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
  // Returns paginated audit logs for admins with optional filters.
  async listAuditLogs({ page = 1, search = "", action = "", target_type = "" } = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (action) params.set("action", action);
    if (target_type) params.set("target_type", target_type);
    const { data } = await api.get(`/api/admin/audit-logs?${params.toString()}`);
    return data;
  },
  // Deletes one audit log by id.
  async deleteAuditLog(id) {
    const { data } = await api.delete(`/api/admin/audit-logs/${id}`);
    return data;
  },
  // Deletes all audit logs.
  async clearAuditLogs() {
    const { data } = await api.delete("/api/admin/audit-logs");
    return data;
  },
};
