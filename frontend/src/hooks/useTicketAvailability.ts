import { useQuery } from "@tanstack/react-query";
import { fetchEventDetails } from "../api/events.api";
import { EventDetails } from "../types/Event";

export const useTicketAvailability = (eventId: string | undefined) => {
  return useQuery<EventDetails>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId!),
    enabled: Boolean(eventId),
  });
};
