import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, usuariosApi } from "@/api/auth";
import { toApiError } from "@/api/http";
import { decodeJwt, getScopes, isAdmin as computeIsAdmin, isExpired } from "@/lib/jwt";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/storage";
import type { UsuarioRequest } from "@/types/domain";

interface AuthUser {
  email: string;
  scopes: string[];
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (data: UsuarioRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUser(token: string): AuthUser | null {
  const claims = decodeJwt(token);
  if (!claims?.sub) return null;
  const scopes = getScopes(token);
  return { email: claims.sub, scopes, isAdmin: computeIsAdmin(scopes) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token && !isExpired(token)) {
      setUser(buildUser(token));
    } else if (token) {
      clearStoredToken();
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    try {
      const res = await authApi.login({ email, senha });
      setStoredToken(res.accessToken);
      setUser(buildUser(res.accessToken));
    } catch (err) {
      throw toApiError(err);
    }
  }, []);

  const cadastrar = useCallback(async (data: UsuarioRequest) => {
    try {
      await usuariosApi.cadastrar(data);
    } catch (err) {
      throw toApiError(err);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, cadastrar, logout }), [user, loading, login, cadastrar, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
