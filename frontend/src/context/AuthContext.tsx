import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { login as loginRequest } from "../api/auth";
import SessionExpiredModal from "../components/admin/SessionExpiredModal";
import { onSessionExpired } from "../lib/authEvents";

const TOKEN_STORAGE_KEY = "casalilly_admin_token";

interface AuthContextValue {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  sessionExpired: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [sessionExpired, setSessionExpired] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    const { access_token } = await loginRequest(username, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
    setToken(access_token);
    setSessionExpired(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setSessionExpired(false);
  }, []);

  // A 401 from an authenticated request (see api/client.ts) means the token
  // expired or was revoked — clear it and prompt to log back in, without
  // navigating away from whatever admin page was open (see RequireAuth).
  useEffect(() => {
    return onSessionExpired(() => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setSessionExpired(true);
    });
  }, []);

  const value = useMemo(
    () => ({ token, login, logout, sessionExpired }),
    [token, login, logout, sessionExpired]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {sessionExpired && (
        <SessionExpiredModal
          onLogin={login}
          onCancel={() => setSessionExpired(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/** Redirects to /admin/login when there is no admin token — unless a
 * session just expired, in which case the SessionExpiredModal is handling
 * re-auth in place and this stays put so the admin page underneath isn't
 * lost (see AuthProvider). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, sessionExpired } = useAuth();
  const location = useLocation();

  if (!token && !sessionExpired) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
