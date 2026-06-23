import { User } from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: User["role"];
  createdAt: Date;
};

export const sanitizeUser = (user: User): SafeUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
});
