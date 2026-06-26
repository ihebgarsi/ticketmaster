import { api } from "./client";

export const reserveTickets = async (payload: { ticketIds: string[] }) => {
  const response = await api.post("/tickets/reserve", payload);
  return response.data as {
    orderId: string;
    reservedUntil: string;
    ticketIds: string[];
  };
};

export const reserveFirstAvailable = async (eventId: string) => {
  const response = await api.post("/tickets/reserve-first", { eventId });
  return response.data as {
    orderId: string;
    reservedUntil: string;
    ticketIds: string[];
  };
};
