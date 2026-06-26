import { Request, Response } from "express";
import { z } from "zod";
import {
  reserveFirstAvailableForEvent,
  reserveTickets,
} from "./tickets.service";

const reserveSchema = z.object({
  ticketIds: z.array(z.string().uuid()).min(1),
});

const reserveFirstSchema = z.object({
  eventId: z.string().uuid(),
});

export const reserveTicketsHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const parsed = reserveSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        message: "Invalid reservation payload",
        errors: parsed.error.format(),
      });
  }

  const result = await reserveTickets(req.userId, parsed.data.ticketIds);
  return res.status(201).json(result);
};

export const reserveFirstAvailableHandler = async (
  req: Request,
  res: Response
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const parsed = reserveFirstSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid reservation payload",
      errors: parsed.error.format(),
    });
  }

  const result = await reserveFirstAvailableForEvent(
    req.userId,
    parsed.data.eventId
  );
  return res.status(201).json(result);
};
