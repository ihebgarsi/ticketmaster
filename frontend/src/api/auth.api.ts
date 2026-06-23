import { api } from "./client";
import type { AuthResponse } from "../types/User";

export const register = async (payload: {
  email: string;
  password: string;
  name?: string;
}) => {
  const res = await api.post<AuthResponse>("/auth/register", payload);
  return res.data;
};

export const login = async (payload: { email: string; password: string }) => {
  const res = await api.post<AuthResponse>("/auth/login", payload);
  return res.data;
};

export const googleLogin = async (payload: { token: string }) => {
  const res = await api.post<AuthResponse>("/auth/google", payload);
  return res.data;
};

export const refresh = async () => {
  const res = await api.post<Pick<AuthResponse, "accessToken" | "user">>(
    "/auth/refresh"
  );
  return res.data;
};

export const logout = async () => {
  const res = await api.post<{ message: string }>("/auth/logout");
  return res.data;
};
