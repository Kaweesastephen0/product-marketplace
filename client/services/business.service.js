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
  async createUser(payload) {
    const { data } = await api.post("/api/users/", payload);
    return data;
  },
};
