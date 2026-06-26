import { api } from "./client";
import type { CheckoutOrder } from "../types/CheckoutOrder";

export const getOrder = async (orderId: string) => {
  const response = await api.get<CheckoutOrder>(`/orders/${orderId}`);
  return response.data;
};

export const completeOrder = async (orderId: string) => {
  const response = await api.post<{
    message: string;
    order: CheckoutOrder;
  }>(`/orders/${orderId}/complete`);
  return response.data;
};
