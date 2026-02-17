import api from "@/lib/axios";

export const adminService = {
  async statistics() {
    const { data } = await api.get("/api/admin/statistics");
    return data;
  },
  async createBusinessOwner(payload) {
    const { data } = await api.post("/api/create-business-owner", payload);
    return data;
  },
};
