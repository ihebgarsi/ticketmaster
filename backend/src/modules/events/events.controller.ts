import { Request, Response } from "express";
import { db } from "../../shared/db";

const DEFAULT_SECTIONS = ["A", "B"];
const DEFAULT_ROWS = ["1", "2", "3"];
const DEFAULT_SEATS_PER_ROW = 5;
const DEFAULT_PRICE_CENTS = 5000;

const buildDefaultTickets = (eventId: string) => {
  const tickets = [];

  for (const section of DEFAULT_SECTIONS) {
    for (const row of DEFAULT_ROWS) {
      for (let seat = 1; seat <= DEFAULT_SEATS_PER_ROW; seat++) {
        tickets.push({
          eventId,
          section,
          row,
          seatLabel: String(seat),
          priceCents: DEFAULT_PRICE_CENTS,
        });
      }
    }
  }

  return tickets;
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { name, slug, date, venue, description } = req.body;
    if (!name || !slug || !date || !venue) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const event = await db.$transaction(async (tx) => {
      const createdEvent = await tx.event.create({
        data: {
          name,
          slug,
          date: new Date(date),
          venue,
          description,
        },
      });

      await tx.ticket.createMany({
        data: buildDefaultTickets(createdEvent.id),
      });

      return createdEvent;
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Failed to create event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
