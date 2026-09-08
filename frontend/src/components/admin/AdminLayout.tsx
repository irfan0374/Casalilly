import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/admin", label: "Products", end: true },
  { to: "/admin/hero-slides", label: "Hero Banners", end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-rose-100 text-rose-700"
      : "text-stone-600 hover:bg-rose-50 hover:text-rose-600"
  }`;

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-48 flex-shrink-0">
        <div className="mb-6 px-3">
          <p className="font-serif text-lg font-bold text-stone-800">
            Casa Lilly
          </p>
          <p className="text-xs text-stone-400">Admin</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-6 block w-full rounded-lg border border-stone-200 px-3 py-2 text-left text-sm font-medium text-stone-600 transition hover:bg-stone-50"
        >
          Log out
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
