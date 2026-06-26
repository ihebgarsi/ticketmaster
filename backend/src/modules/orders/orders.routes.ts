import { Router } from "express";
import { authenticate } from "../../shared/auth.middleware";
import { completeOrderHandler, getOrderHandler } from "./orders.controller";

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.get("/:orderId", getOrderHandler);
ordersRouter.post("/:orderId/complete", completeOrderHandler);
