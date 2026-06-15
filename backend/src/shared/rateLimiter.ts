import { Request, Response, NextFunction } from "express";
import { getRedis } from "./redis";

const WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100);

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const identifier =
    (req.ip || req.headers["x-forwarded-for"]?.toString()) ?? "anonymous";
  const redis = getRedis();
  const key = `rate:${identifier}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  if (count > MAX_REQUESTS) {
    return res.status(429).json({ message: "Rate limit exceeded" });
  }

  return next();
};
