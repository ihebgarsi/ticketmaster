import { api } from "./client";

export const fetchEvents = async () => {
  const response = await api.get("/events");
  return response.data as Array<{
    id: string;
    name: string;
    date: string;
    venue: string;
    description?: string;
  }>;
};

export const fetchEventDetails = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data as {
    id: string;
    name: string;
    date: string;
    venue: string;
    description?: string;
    availability: Record<string, number>;
  };
};
