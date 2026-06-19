import { Request, Response } from "express";
import { db } from "../../shared/db";
import { log } from "node:console";
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
    console.log("errrrr");

    return res.status(400).json({ message: "Failed to create event" });
  }
  console.log("succcc", events);

  return res.status(201).json(events);
};
