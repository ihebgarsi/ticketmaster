import { db } from "../../shared/db";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import { randomBytes } from "crypto";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET ?? "dev_secret";
const ACCESS_TOKEN_EXPIRY: string | number | undefined =
  process.env.ACCESS_TOKEN_EXPIRY ?? "15m";
const REFRESH_TOKEN_EXPIRY_SECONDS = Number(
  process.env.REFRESH_TOKEN_EXPIRY_SECONDS ?? 60 * 60 * 24 * 7
); // 7 days

export const authService = {
  async register(payload: { email: string; password: string; name?: string }) {
    const existing = await (db as any).user.findUnique({
      where: { email: payload.email },
    });
    if (existing) throw new Error("User already exists");

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await (db as any).user.create({
      data: {
        email: payload.email,
        name: payload.name,
        passwordHash,
      },
    });

    const tokens = await this.createTokensForUser(user.id);
    return { user, tokens };
  },

  async login(email: string, password: string) {
    const user = await (db as any).user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");
    if (!user.passwordHash) throw new Error("Invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    const tokens = await this.createTokensForUser(user.id);
    return { user, tokens };
  },

  async createTokensForUser(userId: string) {
    const accessToken = jwt.sign(
      { sub: userId } as jwt.JwtPayload,
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
    );

    const refreshToken = randomBytes(48).toString("hex");
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000
    );

    await (db as any).refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken, expiresAt };
  },

  async refresh(refreshToken: string) {
    const record = await (db as any).refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!record || record.revoked) throw new Error("Invalid refresh token");
    if (record.expiresAt < new Date()) throw new Error("Refresh token expired");

    // issue a new access token (do not rotate refresh token for simplicity)
    const accessToken = jwt.sign(
      { sub: record.userId } as jwt.JwtPayload,
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
    );

    return { accessToken };
  },
};

export default authService;
