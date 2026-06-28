import { Request, Response } from "express";
import { listAvailableTicketsForEvent } from "../tickets/tickets.service";
import { AppError } from "../../shared/errors";

export const listEventTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await listAvailableTicketsForEvent(req.params.id);
    return res.json(tickets);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({ message: error.message });
    }
    throw error;
  }
};
