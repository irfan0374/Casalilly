import { useLocation, useNavigate, type Location } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import logo from "../../assets/logo-180.png";
import LoginForm from "../../components/admin/LoginForm";
import { useAuth } from "../../context/AuthContext";

interface LocationState {
  from?: Location;
}

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin(username: string, password: string) {
    await login(username, password);
    const state = location.state as LocationState | null;
    navigate(state?.from?.pathname ?? "/admin", { replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fcf9fd] px-5 py-10 font-admin text-stone-800 antialiased">
      {/* Soft decorative petals */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-100/70 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-rose-100/50 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Casa Lilly"
            className="h-24 w-24 rounded-full bg-white object-cover p-1 shadow-sm ring-1 ring-rose-100"
          />
          <h1 className="mt-6 font-display text-4xl font-bold text-stone-900">Welcome back</h1>
          <p className="mt-2 text-[15px] text-stone-500">Sign in to manage your shop</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
          <LoginForm onLogin={handleLogin} submitLabel="Sign in" />
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-stone-400">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Casa Lilly admin · authorised staff only
        </p>
      </div>
    </div>
  );
}
