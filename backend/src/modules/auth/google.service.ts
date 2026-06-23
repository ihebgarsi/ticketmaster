import { OAuth2Client, TokenPayload } from "google-auth-library";
import { Prisma } from "@prisma/client";
import { db } from "../../shared/db";
import { authService } from "./auth.service";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = {
  async verifyIdToken(idToken: string): Promise<TokenPayload> {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }
    return payload;
  },

  async signInWithGoogle(idToken: string) {
    const payload = await this.verifyIdToken(idToken);
    const email = payload.email!;
    const googleId = payload.sub!;
    const name = payload.name;

    let user = await db.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await db.user.findUnique({ where: { email } });
    }

    if (!user) {
      try {
        user = await db.user.create({
          data: { email, googleId, name },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          user = await db.user.findUnique({ where: { email } });
          if (!user) throw err;
        } else {
          throw err;
        }
      }
    }

    if (!user.googleId) {
      user = await db.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const tokens = await authService.createTokensForUser(user.id);
    return { user, tokens };
  },
};
