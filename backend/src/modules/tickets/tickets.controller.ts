import { Request, Response } from "express";
import { z } from "zod";
import { reserveTickets } from "./tickets.service";

const reserveSchema = z.object({
  userId: z.string().uuid(),
  ticketIds: z.array(z.string().uuid()).min(1),
});

export const reserveTicketsHandler = async (req: Request, res: Response) => {
  const parsed = reserveSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        message: "Invalid reservation payload",
        errors: parsed.error.format(),
      });
  }

  const result = await reserveTickets(
    parsed.data.userId,
    parsed.data.ticketIds
  );
  return res.status(201).json(result);
};
