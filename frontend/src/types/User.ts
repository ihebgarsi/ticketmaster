export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  expiresAt: string;
};

export type SignupForm = {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
  dateOfBirth?: string;
  phone?: number;
};
