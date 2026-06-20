import { api } from "./client";

export const register = async (payload: {
  email: string;
  password: string;
  name?: string;
}) => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const login = async (payload: { email: string; password: string }) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

export const refresh = async () => {
  const res = await api.post("/auth/refresh");
  return res.data;
};
