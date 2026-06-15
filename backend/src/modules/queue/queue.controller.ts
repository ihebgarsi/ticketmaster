import { Request, Response } from "express";
import { addToQueue, getQueueStatus } from "./queue.service";

export const addToQueueHandler = async (req: Request, res: Response) => {
  const { sessionId, eventId } = req.body;
  if (!sessionId || !eventId) {
    return res
      .status(400)
      .json({ message: "sessionId and eventId are required" });
  }

  const status = await addToQueue(sessionId, eventId);
  return res.status(202).json(status);
};

export const getQueueStatusHandler = async (req: Request, res: Response) => {
  const { eventId, sessionId } = req.params;
  if (!eventId || !sessionId) {
    return res
      .status(400)
      .json({ message: "eventId and sessionId are required" });
  }

  const status = await getQueueStatus(sessionId, eventId);
  return res.json(status);
};
