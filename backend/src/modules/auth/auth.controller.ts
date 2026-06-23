import { Request, Response } from "express";
import { authService } from "./auth.service";
import { googleAuthService } from "./google.service";
import { sanitizeUser } from "./auth.utils";

const setRefreshCookie = (res: Response, refreshToken: string) => {
  const secure = process.env.NODE_ENV === "production";
  const maxAge =
    Number(process.env.REFRESH_TOKEN_EXPIRY_SECONDS ?? 60 * 60 * 24 * 7) * 1000;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge,
    path: "/",
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie("refreshToken", { path: "/" });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing email or password" });

    const result = await authService.register({ email, password, name });
    setRefreshCookie(res, result.tokens.refreshToken);
    return res.status(201).json({
      user: sanitizeUser(result.user),
      accessToken: result.tokens.accessToken,
      expiresAt: result.tokens.expiresAt,
    });
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
    setRefreshCookie(res, result.tokens.refreshToken);

    return res.json({
      user: sanitizeUser(result.user),
      accessToken: result.tokens.accessToken,
      expiresAt: result.tokens.expiresAt,
    });
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: err.message ?? "Invalid credentials" });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Missing token" });

    const result = await googleAuthService.signInWithGoogle(token);
    setRefreshCookie(res, result.tokens.refreshToken);

    return res.json({
      user: sanitizeUser(result.user),
      accessToken: result.tokens.accessToken,
      expiresAt: result.tokens.expiresAt,
    });
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: err.message ?? "Google login failed" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken)
      return res.status(400).json({ message: "Missing refresh token" });

    const result = await authService.refresh(refreshToken);
    return res.json({
      accessToken: result.accessToken,
      user: sanitizeUser(result.user),
    });
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: err.message ?? "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshCookie(res);
    return res.json({ message: "Logged out" });
  } catch (err: any) {
    return res
      .status(400)
      .json({ message: err.message ?? "Failed to logout" });
  }
};
