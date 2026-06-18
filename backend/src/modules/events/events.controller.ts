import { Request, Response } from "express";
import { db } from "../../shared/db";
export const createEvent = async (req: Request, res: Response) => {
  const { name, slug, date, venue, description } = req.body;
  const events = db.event.create({
    data: {
      name: name,
      slug: slug,
      date: new Date(date),
      venue: venue,
      description: description,
    },
  });
  if (!events) {
    return res.status(400).json({ message: "Failed to create event" });
  }
  return res.status(201).json(events);
};
