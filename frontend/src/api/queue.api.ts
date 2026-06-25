import { api } from "./client";
import type { QueueStatus } from "../types/Queue";

export const enterQueue = async (eventId: string) => {
  const response = await api.post<QueueStatus>("/queue/enter", { eventId });
  return response.data;
};

export const getQueueStatus = async (eventId: string) => {
  const response = await api.get<QueueStatus>(`/queue/status/${eventId}`);
  return response.data;
};

export const leaveQueue = async (eventId: string) => {
  await api.delete(`/queue/leave/${eventId}`);
};
