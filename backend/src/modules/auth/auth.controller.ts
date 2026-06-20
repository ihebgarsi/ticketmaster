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
    const secure = process.env.NODE_ENV === "production";
    const maxAge =
      Number(process.env.REFRESH_TOKEN_EXPIRY_SECONDS ?? 60 * 60 * 24 * 7) *
      1000;

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return res.json({
      user: result.user,
      accessToken: result.tokens.accessToken,
      expiresAt: result.tokens.expiresAt,
    });
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: err.message ?? "Invalid credentials" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
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
