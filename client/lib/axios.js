import axios from "axios";

function extractBackendMessage(payload) {
  if (!payload) return null;
  if (typeof payload === "string") return payload;

  if (typeof payload.detail === "string") return payload.detail;

  const commonKeys = ["message", "non_field_errors", "error"];
  for (const key of commonKeys) {
    const value = payload[key];
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length) return String(value[0]);
  }

  for (const value of Object.values(payload)) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length) return String(value[0]);
    if (value && typeof value === "object") {
      const nested = extractBackendMessage(value);
      if (nested) return nested;
    }
  }

  return null;
}

const api = axios.create({
  baseURL: "",
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["Content-Type"] = "application/json";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const payload = error?.response?.data;
    const message = extractBackendMessage(payload) || error?.message || "Request failed";

    if (
      typeof window !== "undefined" &&
      status === 401 &&
      !String(error?.config?.url || "").includes("/api/auth/login")
    ) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    const nextError = new Error(message);
    nextError.status = status;
    nextError.payload = payload;
    return Promise.reject(nextError);
  },
);

export default api;
