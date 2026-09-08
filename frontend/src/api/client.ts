import axios from "axios";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the admin JWT (if present) to every request. We read straight from
// localStorage here rather than importing AuthContext to avoid a React <->
// axios circular dependency; AuthContext is the single source of truth that
// writes this key.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("casalilly_admin_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
