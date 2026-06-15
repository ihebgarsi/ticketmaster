import { Router } from "express";
import { addToQueueHandler, getQueueStatusHandler } from "./queue.controller";

export const queueRouter = Router();

queueRouter.post("/enter", addToQueueHandler);
queueRouter.get("/status/:eventId/:sessionId", getQueueStatusHandler);
