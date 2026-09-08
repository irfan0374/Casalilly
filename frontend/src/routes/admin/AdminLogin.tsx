import { useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface LocationState {
  from?: Location;
}

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password);
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname ?? "/admin", { replace: true });
    } catch {
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-rose-100 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-2xl font-bold text-stone-800">
          Admin Login
        </h1>
        <p className="mb-6 text-sm text-stone-500">
          Sign in to manage Casa Lilly's catalog.
        </p>

        <label className="mb-1 block text-sm font-medium text-stone-700">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
          className="mb-4 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
        />

        <label className="mb-1 block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
        />

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
