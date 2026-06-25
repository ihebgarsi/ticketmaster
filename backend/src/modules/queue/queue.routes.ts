import { Router } from "express";
import { authenticate } from "../../shared/auth.middleware";
import {
  addToQueueHandler,
  getQueueStatusHandler,
  leaveQueueHandler,
} from "./queue.controller";

export const queueRouter = Router();

queueRouter.use(authenticate);

queueRouter.post("/enter", addToQueueHandler);
queueRouter.get("/status/:eventId", getQueueStatusHandler);
queueRouter.delete("/leave/:eventId", leaveQueueHandler);
