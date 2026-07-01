import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "express-async-errors";
import { json } from "express";
import { ticketsRouter } from "./modules/tickets/tickets.routes";
import { eventsRouter } from "./modules/events/events.routes";
import { queueRouter } from "./modules/queue/queue.routes";
import { ordersRouter } from "./modules/orders/orders.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./shared/errors";
import { healthHandler } from "./shared/health";
import { rateLimiter } from "./shared/rateLimiter";

export const createApp = () => {
  const app = express();
  app.set("trust proxy", 1);

  app.get("/health", healthHandler);

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5323",
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(json());
  app.use(rateLimiter);

  app.get("/api/health", healthHandler);

  app.use("/api/events", eventsRouter);
  app.use("/api/tickets", ticketsRouter);
  app.use("/api/queue", queueRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/auth", authRouter);

  app.use(errorHandler);
  return app;
};
