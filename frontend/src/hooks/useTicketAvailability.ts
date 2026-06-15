import { useQuery } from "@tanstack/react-query";
import { fetchEventDetails } from "../api/events";

export const useTicketAvailability = (eventId: string | undefined) => {
  return useQuery(
    ["event", eventId, "availability"],
    () => fetchEventDetails(eventId!),
    {
      enabled: Boolean(eventId),
    }
  );
};
