import { useQuery } from "@tanstack/react-query";
import { fetchEventDetails } from "../api/events.api";

export const useTicketAvailability = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId!),
    enabled: Boolean(eventId),
  });
};
