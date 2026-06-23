import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { db } from "./db";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET ?? "dev_secret";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (!payload.sub || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.userId = payload.sub;
    if (payload.role === Role.ADMIN || payload.role === Role.USER) {
      req.userRole = payload.role;
    }
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.userRole === Role.ADMIN) {
    return next();
  }

  const user = await db.user.findUnique({
    where: { id: req.userId },
    select: { role: true },
  });

  if (!user || user.role !== Role.ADMIN) {
    return res.status(403).json({ message: "Admin access required" });
  }

  req.userRole = Role.ADMIN;
  return next();
};
