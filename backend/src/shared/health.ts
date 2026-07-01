import { Request, Response } from "express";
import { db } from "./db";
import { getRedis } from "./redis";

export const healthHandler = async (_req: Request, res: Response) => {
  try {
    await db.$queryRaw`SELECT 1`;
    await getRedis().ping();

    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return res.status(503).json({
      status: "error",
      message: "Service unavailable",
    });
  }
};
