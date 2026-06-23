import axios from "axios";

type TokenGetter = () => string | null;
type TokenRefresher = () => Promise<string | null>;
type AuthFailureHandler = () => void;

let getAccessToken: TokenGetter = () => null;
let refreshAccessToken: TokenRefresher = async () => null;
let onAuthFailure: AuthFailureHandler = () => {};

export const configureApiAuth = (config: {
  getAccessToken: TokenGetter;
  refreshAccessToken: TokenRefresher;
  onAuthFailure: AuthFailureHandler;
}) => {
  getAccessToken = config.getAccessToken;
  refreshAccessToken = config.refreshAccessToken;
  onAuthFailure = config.onAuthFailure;
};

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/register") &&
      !original.url?.includes("/auth/google") &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      onAuthFailure();
    }
    return Promise.reject(error);
  }
);
