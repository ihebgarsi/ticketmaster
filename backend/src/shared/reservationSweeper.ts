import { setInterval } from "node:timers";
import { releaseExpiredReservations } from "../modules/tickets/tickets.service";

export const startReservationSweeper = () => {
  const intervalMs = 30_000;
  setInterval(async () => {
    try {
      await releaseExpiredReservations();
    } catch (error) {
      console.error("Reservation sweeper failed", error);
    }
  }, intervalMs);
};
