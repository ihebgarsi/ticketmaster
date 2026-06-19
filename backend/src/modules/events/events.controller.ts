import { Request, Response } from "express";
import { db } from "../../shared/db";
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { name, slug, date, venue, description } = req.body;
    if (!name || !slug || !date || !venue) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const event = await db.event.create({
      data: {
        name,
        slug,
        date: new Date(date),
        venue,
        description,
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Failed to create event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
