import { api } from "./client";
import { Event, EventDetails, EventInput } from "../types/Event";
export const fetchEvents = async () => {
  const response = await api.get("/events");
  return response.data as Array<Event>;
};

export const fetchEventDetails = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data as EventDetails;
};

export const createEvent = async (eventData: EventInput) => {
  const response = await api.post("/events", eventData);
  return response.data as Event;
};
