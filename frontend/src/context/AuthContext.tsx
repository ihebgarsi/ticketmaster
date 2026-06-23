import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  googleLogin as apiGoogleLogin,
  refresh as apiRefresh,
  logout as apiLogout,
} from "../api/auth.api";
import { configureApiAuth } from "../api/client";
import type { AuthResponse, AuthUser } from "../types/User";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  const setSession = useCallback((data: AuthResponse) => {
    accessTokenRef.current = data.accessToken;
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const data = await apiRefresh();
      accessTokenRef.current = data.accessToken;
      setAccessToken(data.accessToken);
      if (data.user) {
        setUser(data.user);
      }
      return data.accessToken;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    configureApiAuth({
      getAccessToken: () => accessTokenRef.current,
      refreshAccessToken,
      onAuthFailure: clearSession,
    });
  }, [refreshAccessToken, clearSession]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const data = await apiRefresh();
        accessTokenRef.current = data.accessToken;
        setAccessToken(data.accessToken);
        if (data.user) {
          setUser(data.user);
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin({ email, password });
      setSession(data);
    },
    [setSession]
  );

  const register = useCallback(
    async (payload: { email: string; password: string; name?: string }) => {
      const data = await apiRegister(payload);
      setSession(data);
    },
    [setSession]
  );

  const googleLogin = useCallback(
    async (token: string) => {
      const data = await apiGoogleLogin({ token });
      setSession(data);
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(user && accessToken),
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      googleLogin,
      logout,
    }),
    [user, accessToken, isLoading, login, register, googleLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
