import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ message: err.message, details: err.details });
  }

  console.error("Unexpected error", err);
  return res.status(500).json({ message: "Internal server error" });
};
