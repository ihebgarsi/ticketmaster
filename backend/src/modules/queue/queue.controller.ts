import { Request, Response } from "express";
import {
  addToQueue,
  getQueueStatus,
  removeFromQueue,
} from "./queue.service";

export const addToQueueHandler = async (req: Request, res: Response) => {
  const { eventId } = req.body;
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ message: "eventId is required" });
  }

  const status = await addToQueue(req.userId, eventId);
  return res.status(202).json(status);
};

export const getQueueStatusHandler = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (!eventId) {
    return res.status(400).json({ message: "eventId is required" });
  }

  const status = await getQueueStatus(req.userId, eventId);
  return res.json(status);
};

export const leaveQueueHandler = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (!eventId) {
    return res.status(400).json({ message: "eventId is required" });
  }

  await removeFromQueue(req.userId, eventId);
  return res.status(204).send();
};
