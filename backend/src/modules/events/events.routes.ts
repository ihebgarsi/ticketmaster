import { Router } from "express";
import { authenticate, requireAdmin } from "../../shared/auth.middleware";
import { listEvents, getEventDetails } from "./events.service";
import { createEvent } from "./events.controller";
import { listEventTickets } from "./events.tickets.controller";

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res) => {
  const events = await listEvents();
  res.json(events);
});

eventsRouter.get("/:id/tickets", listEventTickets);

eventsRouter.get("/:id", async (req, res) => {
  const event = await getEventDetails(req.params.id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  return res.json(event);
});

eventsRouter.post("/", authenticate, requireAdmin, createEvent);
