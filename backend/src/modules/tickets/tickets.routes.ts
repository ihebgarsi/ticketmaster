import { Router } from "express";
import { reserveTicketsHandler } from "./tickets.controller";

export const ticketsRouter = Router();

ticketsRouter.post("/reserve", reserveTicketsHandler);
