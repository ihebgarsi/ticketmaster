import { Request, Response } from "express";
import { completeOrder, getOrderForUser } from "./orders.service";

export const getOrderHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const order = await getOrderForUser(req.userId, req.params.orderId);
  return res.json(order);
};

export const completeOrderHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const order = await completeOrder(req.userId, req.params.orderId);
  return res.json({
    message: "Payment completed successfully",
    order,
  });
};
