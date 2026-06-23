import { Router } from "express";
import {
  register,
  login,
  refresh,
  googleLogin,
  logout,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/google", googleLogin);
authRouter.post("/logout", logout);
