import api from "@/lib/axios";

export const authService = {
  // Performs login operations.
  async login(payload) {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
  },
  // Performs logout operations.
  async logout() {
    const { data } = await api.post("/api/auth/logout", {});
    return data;
  },
  // Performs me operations.
  async me() {
    const { data } = await api.get("/api/auth/me");
    return data;
  },
  // Performs update profile operations.
  async updateProfile(payload) {
    const { data } = await api.patch("/api/auth/me", payload);
    return data;
  },
  // Performs register viewer operations.
  async registerViewer(payload) {
    const { data } = await api.post("/api/register", payload);
    return data;
  },
};
