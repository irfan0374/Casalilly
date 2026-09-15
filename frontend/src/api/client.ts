import axios from "axios";
import { emitSessionExpired } from "../lib/authEvents";

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const TOKEN_STORAGE_KEY = "casalilly_admin_token";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the admin JWT (if present) to every request. We read straight from
// localStorage here rather than importing AuthContext to avoid a React <->
// axios circular dependency; AuthContext is the single source of truth that
// writes this key.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on a request that WAS carrying a token means it expired or was
// revoked server-side — not just "wrong password" on the login form itself,
// which never attaches a token in the first place. Surface that as a
// session-expired event so the UI can prompt to log back in instead of
// requests just silently failing.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_STORAGE_KEY)) {
      emitSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
