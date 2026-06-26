import { Router } from "express";
import { authenticate } from "../../shared/auth.middleware";
import {
  reserveFirstAvailableHandler,
  reserveTicketsHandler,
} from "./tickets.controller";

export const ticketsRouter = Router();

ticketsRouter.post("/reserve", authenticate, reserveTicketsHandler);
ticketsRouter.post(
  "/reserve-first",
  authenticate,
  reserveFirstAvailableHandler
);
