import { Request, Response } from "express";
import { authService } from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    const result = await authService.register({ email, password, name });
    return res.status(201).json(result);
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Failed to register" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    const result = await authService.login(email, password);
    return res.json(result);
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: err.message ?? "Invalid credentials" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Missing refresh token" });

    const result = await authService.refresh(refreshToken);
    return res.json(result);
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: err.message ?? "Invalid refresh token" });
  }
};
